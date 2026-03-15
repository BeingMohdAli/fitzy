package com.fitzy.activity.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ACTIVITY_EXCHANGE = "fitzy.activity.exchange";
    public static final String ACTIVITY_QUEUE = "fitzy.activity.queue";
    public static final String ACTIVITY_ROUTING_KEY = "activity.tracked";

    @Bean
    public TopicExchange activityExchange() {
        return new TopicExchange(ACTIVITY_EXCHANGE);
    }

    @Bean
    public Queue activityQueue() {
        return QueueBuilder.durable(ACTIVITY_QUEUE).build();
    }

    @Bean
    public Binding activityBinding() {
        return BindingBuilder
                .bind(activityQueue())
                .to(activityExchange())
                .with(ACTIVITY_ROUTING_KEY);
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
