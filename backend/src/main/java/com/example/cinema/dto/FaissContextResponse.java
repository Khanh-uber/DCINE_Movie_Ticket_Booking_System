package com.example.cinema.dto;

import java.util.List;

public class FaissContextResponse {

    private List<FaissContext> contexts;

    public FaissContextResponse() {}

    public List<FaissContext> getContexts() {
        return contexts;
    }

    public void setContexts(List<FaissContext> contexts) {
        this.contexts = contexts;
    }

    public static class FaissContext {
        private String title;
        private String content;

        public FaissContext() {}

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
}
