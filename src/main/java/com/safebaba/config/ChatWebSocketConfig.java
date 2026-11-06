package com.safebaba.config;
import com.safebaba.realtime.ChatWebSocketHandler; import com.safebaba.realtime.ChatHandshakeInterceptor; import org.springframework.beans.factory.annotation.Value; import org.springframework.context.annotation.Configuration; import org.springframework.web.socket.config.annotation.*;
@Configuration @EnableWebSocket public class ChatWebSocketConfig implements WebSocketConfigurer {
 private final ChatWebSocketHandler handler; private final ChatHandshakeInterceptor interceptor; private final String[] origins;
 public ChatWebSocketConfig(ChatWebSocketHandler h,ChatHandshakeInterceptor i,@Value("${app.cors.origens}") String allowed){handler=h;interceptor=i;origins=allowed.trim().split("\\s*,\\s*");}
 @Override public void registerWebSocketHandlers(WebSocketHandlerRegistry registry){registry.addHandler(handler,"/ws/chat/{conversaId}").addInterceptors(interceptor).setAllowedOrigins(origins);}
}
