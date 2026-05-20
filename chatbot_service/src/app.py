# from src.agents.engine import CinemaAgent
import os 
from dotenv import load_dotenv
from tools.movie_tools import AVAILABLE_TOOLS, TOOLS
from openai import OpenAI
import json 
from agents.prompt import SYSTEM_PROMPT
from datetime import date 
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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
class ChatRequest(BaseModel):
    user_message: str
    chat_history: list = []      
    summary_context: str = ""
@app.post("/api/chat")
async def chat_with_agent(request: ChatRequest):
    try:
        user_input = request.user_message

        chat_memory = AgentMemory(max_messages=12)
        chat_memory.history = request.chat_history.copy()
        chat_memory.summary_context = request.summary_context

        chat_memory.add_message(role="user", content=user_input)

        # 3. Gọi OpenAI lần 1 để nhận diện Intent / Kích hoạt Tool Call
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=chat_memory.build_api_messages(),
            tools=TOOLS,
            tool_choice="auto"
        )

        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls

        ui_action = None
        frontend_data_payload = None

        if tool_calls:
            formatted_tool_calls = []
            for tc in tool_calls:
                formatted_tool_calls.append({
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments
                    }
                })
            chat_memory.add_message(role="assistant", content=response_message.content, tool_calls=formatted_tool_calls)

            for tool_call in tool_calls:
                function_name = tool_call.function.name
                raw_args = tool_call.function.arguments
                print(f"   |- [TOOL RUNNING]: {function_name}")
                
                function_to_call = AVAILABLE_TOOLS[function_name]
                function_args = json.loads(raw_args)

                
                raw_function_response = function_to_call(**function_args)
                try:
                    res_obj = json.loads(raw_function_response)
                    
                    # Trích xuất lệnh điều hướng UI ngầm (DISPLAY_MOVIE_LIST hoặc OPEN_SEAT_MAP)
                    if "action" in res_obj:
                        ui_action = res_obj["action"]
                    
                    
                    if "frontend_data" in res_obj:
                        frontend_data_payload = res_obj.pop("frontend_data", None)
            
                    clean_response_for_ai = json.dumps(res_obj, ensure_ascii=False)
                except Exception:
                    clean_response_for_ai = raw_function_response

                # Lưu cục dữ liệu ĐÃ LÀM SẠCH VÀ NÊN vào Trí nhớ Agent 
                chat_memory.add_message(
                    role="tool",
                    content=clean_response_for_ai,
                    tool_call_id=tool_call.id,
                    name=function_name
                )
            second_response = client.chat.completions.create(
                model="gpt-4o",
                messages=chat_memory.build_api_messages(),
            )
            final_text = second_response.choices[0].message.content
            
            # Lưu câu trả lời cuối cùng của Bot vào Trí nhớ trước khi đóng gói payload
            chat_memory.add_message(role="assistant", content=final_text)
        # 6. TRƯỜNG HỢP CHAT THÔNG THƯỜNG (Không cần gọi hàm)
        else:
            final_text = response_message.content
            chat_memory.add_message(role="assistant", content=final_text)

        return {
            "status": "success",
            "bot_message": final_text,            
            "action": ui_action,                     # Tín hiệu mở UI ("DISPLAY_MOVIE_LIST" hoặc "OPEN_SEAT_MAP")
            "frontend_data": frontend_data_payload,   # Cục data phim/ghế thô an toàn (0 Token OpenAI)
            "updated_history": chat_memory.history,   # Mảng lịch sử mới đã xử lý trượt để lượt chat sau gửi lên tiếp
            "summary_context": chat_memory.summary_context 
        }
    except Exception as e:
        print(f"[API ERROR]: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)