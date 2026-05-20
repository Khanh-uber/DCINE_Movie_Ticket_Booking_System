# from src.agents.engine import CinemaAgent
import os 
from dotenv import load_dotenv
from tools.movie_tools import AVAILABLE_TOOLS, TOOLS
from openai import OpenAI
import json 
from agents.prompt import SYSTEM_PROMPT
from datetime import date 
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)
app = FastAPI()
class AgentMemory:
    def __init__ (self, max_messages : int = 12):
        self.max_messages = max_messages  # Sliding Window: Giữ tối đa 12 tin nhắn gần nhất
        self.history = []                 # Mảng lưu lịch sử chat thực tế suốt phiên chạy
        self.summary_context = ""         # Lưu trữ tóm tắt nền (Summary Memory)
    def get_dynamic_system_prompt(self) -> str:
        past_context = f"\n- NGỮ CẢNH QUÁ KHỨ (TÓM TẮT): {self.summary_context}\n" if self.summary_context else ""
        
        return f"{SYSTEM_PROMPT}\n{past_context}"
    def add_message(self, role: str, content: str = None, tool_calls: list = None, tool_call_id: str = None, name: str = None):
        msg = {"role": role}
        if content is not None: msg["content"] = content
        if tool_calls is not None: msg["tool_calls"] = tool_calls
        if tool_call_id is not None: msg["tool_call_id"] = tool_call_id
        if name is not None: msg["name"] = name

        self.history.append(msg)
        self.control_context_window()
    def control_context_window(self):
        """Kiểm soát Cửa sổ Ngữ cảnh: Tự động nén tóm tắt và tỉa bớt tin nhắn cũ"""
        if len(self.history) > self.max_messages:
            print("[CONTEXT CONTROL]: Lịch sử hội thoại quá dài! Đang tiến hành nén bộ nhớ...")

            # Bỏ tool và system
            chat_to_summarize = [m for m in self.history[:-4] if m["role"] in ["user", "assistant"] and m.get("content")]
            if chat_to_summarize:
                try:
                    sum_prompt = f"Hãy cập nhật và tóm tắt ngắn gọn nhu cầu của khách hàng từ chuỗi chat sau thành 1 câu duy nhất. Bản tóm tắt cũ: {self.summary_context}"
                    sum_res = client.chat.completions.create(
                        model="gpt-4o", 
                        messages=[{"role": "system", "content": sum_prompt}] + chat_to_summarize 
                    )
                    self.summary_context = sum_res.choices[0].message.content
                    print(f"[MEMORIZED]: {self.summary_context}")
                except Exception as e:
                    print(f"[WARN Memory]: Không tạo được tóm tắt ngầm: {e}")
            
            # Giữ lại 4 tin nhắn mới nhất để cuộc trò chuyện diễn ra liên tục
            self.history = self.history[-4:]
    def build_api_messages(self) -> list:
        """Đóng gói mảng tin nhắn hoàn chỉnh để gửi lên API"""
        return [{"role": "system", "content": self.get_dynamic_system_prompt()}] + self.history
def run():
    chat_memory = AgentMemory(max_messages = 12)
    print("Dcine đã sẵn sàng! Gõ 'exit' để thoát.")

    while True:
        user_input = input("\n👤 Bạn: ")
        if user_input.lower() == 'exit': break


        # Bước 1: Lưu câu hỏi của user vào Trí nhớ
        chat_memory.add_message(role="user", content=user_input)
        # 1. Khởi tạo các biến đếm token toàn cục cho lượt chat này
        total_input_tokens = 0
        total_output_tokens = 0

        try:
            #Gọi AI lần 1 
            response = client.chat.completions.create(
                model="gpt-4o",
                messages= chat_memory.build_api_messages(),
                tools=TOOLS, 
                tool_choice="auto"
            ) 
        except:
            print(f"❌ Lỗi API lần 1: {e}")
            continue

        # ──► CỘNG DỒN TOKEN LẦN 1
        if response.usage:
            total_input_tokens += response.usage.prompt_tokens
            total_output_tokens += response.usage.completion_tokens
        response_message = response.choices[0].message 

        # cac thanh phan trong tool call 
        """
        [
            {
                "id": "call_K9s2jL...", 
                "type": "function",
                "function": {
                    "name": "search_movies",
                    "arguments": "{\"genre\": \"Gia đình\", \"location\": \"Hà Nội\"}"
                }
            }
        ]
        """
        tool_calls = response_message.tool_calls
        

        # Biến hứng dữ liệu thô phục vụ riêng cho hiển thị Front-end UI
        ui_action = None
        frontend_data_payload = None



        if tool_calls:
            formatted_tool_calls = []
            
            for tc in tool_calls:
                formatted_tool_calls.append({
                    "id" : tc.id,
                    "type" : "function",
                    "function" : {
                        "name": tc.function.name , "arguments": tc.function.arguments
                    }
                })
            chat_memory.add_message(role="assistant", content=response_message.content, tool_calls=formatted_tool_calls)


            # 3. Bước 3 của Agentic Loop: Thực thi tuần tự các hàm Backend
            for tool_call in tool_calls:
                function_name = tool_call.function.name

                raw_args = tool_call.function.arguments
                print(f"   |- Hàm: {function_name}")
                print(f"   |- Dữ liệu bóc được: {raw_args}") # Đây là String JSON thô

                function_to_call = AVAILABLE_TOOLS[function_name]

                function_args = json.loads(tool_call.function.arguments) # chuyển string sang dict 


                raw_function_response = function_to_call(**function_args)

                try:
                    # Chuyển kết quả sang dict để phân tách bốc biến tồn tại
                    res_obj = json.loads(raw_function_response)

                    if "action" in res_obj:
                        ui_action = res_obj["action"]
                    if "frontend_data" in res_obj:
                        frontend_data_payload = res_obj.pop("frontend_data", None)
                    clean_response_for_ai = json.dumps(res_obj, ensure_ascii=False)

                except Exception as json_err:
                    # Phòng hờ các hàm khác không trả về chuẩn Object
                    clean_response_for_ai = raw_function_response
                chat_memory.add_message(role="tool", 
                                        content=clean_response_for_ai,
                                        tool_call_id=tool_call.id, 
                                        name=function_name)
            
            try:
                second_response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=chat_memory.build_api_messages(),
                )
                # ──► CỘNG DỒN TOKEN LẦN 2 (Nếu có gọi Tool)
                if second_response.usage:
                    total_input_tokens += second_response.usage.prompt_tokens
                    total_output_tokens += second_response.usage.completion_tokens
                final_text = second_response.choices[0].message.content
                print(f"\nRobot: {final_text}")
                chat_memory.add_message(role="assistant", content=final_text)

                print("\n📊 =================== [TOKEN USAGE REPORT] ===================")
                print(f"📥 Input Tokens (Câu hỏi + Lịch sử + Tool Định Nghĩa): {total_input_tokens}")
                print(f"📤 Output Tokens (Câu trả lời sinh ra từ AI)      : {total_output_tokens}")
                print(f"💵 Tổng số Token tiêu tốn cho lượt chat này        : {total_input_tokens + total_output_tokens}")
                print("===============================================================\n")
                # [DEBUG CONSOLE]: Kiểm tra cấu hình biến bốc tách thành công sẵn sàng cho API
                if ui_action:
                    print(f"📱 [UI TRIGGER]: Lệnh giao diện -> {ui_action}")
                    if frontend_data_payload:
                        print(f"📦 [DATA TO FRONTEND]: Đã cô lập {len(frontend_data_payload)} item phim thô khỏi bộ nhớ AI thành công!")
            except Exception as e:
                print(f"❌ Lỗi API lần 2: {e}")

        else:
            final_text = response_message.content
            print(f"\n🤖 Robot: {final_text}")
            chat_memory.add_message(role="assistant", content=final_text)
import requests
import json
API_URL = "http://127.0.0.1:8000/api/chat"
def test_chat_flow():
    history = []
    print("\n=== CÂU HỎI 1: Gửi yêu cầu tìm phim ===")
    payload_1 = {
        "user_message": "tôi muốn xem phim vô hạn thành ở rạp quận 1?",
        "chat_history": history,
        "summary_context": ""
    }
    res_1 = requests.post(API_URL, json=payload_1)
    data_1 = res_1.json()
    print(f"Bot phản hồi: {data_1['bot_message']}")
    print(f"Hành động UI: {data_1['action']}")
    print(f"Dữ liệu Frontend nhận: {data_1['frontend_data']}")
    history = data_1["updated_history"]

    print("\n=== CÂU HỎI 2: Hỏi vặn lại xem sơ đồ ghế ===")
    payload_2 = {
        "user_message": "Phim này có hay không",
        "chat_history": history, # 🌟 Nạp cục lịch sử vừa nhận ở câu 1 vào đây
        "summary_context": ""
    }
    res_2 = requests.post(API_URL, json=payload_2)
    data_2 = res_2.json()
    
    print(f"Bot phản hồi: {data_2['bot_message']}")
    print(f"Hành động UI (Kỳ vọng: OPEN_SEAT_MAP): {data_2['action']}")
    print(f"Mã ghế đặt (frontend_data): {data_2['frontend_data']}")
if __name__ == "__main__":
    test_chat_flow()

