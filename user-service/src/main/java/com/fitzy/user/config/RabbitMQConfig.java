package com.fitzy.user.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String USER_EXCHANGE = "fitzy.user.exchange";
    public static final String USER_SYNC_QUEUE = "fitzy.user.sync.queue";
    public static final String USER_SYNC_ROUTING_KEY = "user.sync";

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(USER_EXCHANGE);
    }

    @Bean
    public Queue userSyncQueue() {
        return QueueBuilder.durable(USER_SYNC_QUEUE).build();
    }

    @Bean
    public Binding userSyncBinding() {
        return BindingBuilder
                .bind(userSyncQueue())
                .to(userExchange())
                .with(USER_SYNC_ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
