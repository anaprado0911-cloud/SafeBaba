package com.safebaba.realtime;
import org.springframework.stereotype.Component; import org.springframework.web.socket.*; import org.springframework.web.socket.handler.TextWebSocketHandler; import java.util.concurrent.*; import java.util.*;
@Component public class ChatWebSocketHandler extends TextWebSocketHandler {
 private final ConcurrentMap<Long,Set<WebSocketSession>> rooms=new ConcurrentHashMap<>();
 @Override public void afterConnectionEstablished(WebSocketSession s){Long id=(Long)s.getAttributes().get("conversaId");rooms.computeIfAbsent(id,k->ConcurrentHashMap.newKeySet()).add(s);}
 @Override public void afterConnectionClosed(WebSocketSession s,CloseStatus status){Object raw=s.getAttributes().get("conversaId");if(raw instanceof Long id){Set<WebSocketSession> set=rooms.get(id);if(set!=null){set.remove(s);if(set.isEmpty())rooms.remove(id,set);}}}
 public void publicar(Long id,String json){Set<WebSocketSession> set=rooms.getOrDefault(id,Set.of());for(WebSocketSession s:set){if(s.isOpen())try{s.sendMessage(new TextMessage(json));}catch(Exception ignored){}}}
}
