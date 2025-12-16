import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.example.cinema.llm.ConversationContext;

import jakarta.servlet.http.HttpSession;

@Service
public class ConversationMemoryService {

    private HttpSession session;
    public ConversationMemoryService (HttpSession session){
        this.session = session;
    }
    private final Map<String, ConversationContext> store =
            new ConcurrentHashMap<>();

    public ConversationContext get(String key) {
        return store.computeIfAbsent(sessionId, id -> new ConversationContext());
    }

    public void clear(String sessionId) {
        store.remove(sessionId);
    }
}
