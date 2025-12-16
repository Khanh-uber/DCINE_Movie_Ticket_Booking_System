@Service
public class ConversationMemoryService {

    private final Map<String, ConversationContext> store =
            new ConcurrentHashMap<>();

    public ConversationContext get(String sessionId) {
        return store.computeIfAbsent(sessionId, id -> new ConversationContext());
    }

    public void clear(String sessionId) {
        store.remove(sessionId);
    }
}
