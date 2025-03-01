package com.bsltproject.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("seguridad-service", r -> r.path("/seguridad/**")
                        .uri("http://localhost:8080/"))
                .route("finanzas-service", r -> r.path("/finanzas/**")
                        .uri("http://localhost:9999/"))
                .build();
    }
}
