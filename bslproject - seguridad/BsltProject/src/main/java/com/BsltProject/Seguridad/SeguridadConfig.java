package com.BsltProject.Seguridad;

import com.BsltProject.Modelos.Permiso;
import com.BsltProject.Modelos.Rol;
import com.BsltProject.Servicios.RolServicio;
import com.BsltProject.Repositorios.RepositorioRol;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Configuration
public class SeguridadConfig {

    private final JwtFilter jwtFilter;
    private final UserDetailsService userDetailsService;
    private final RolServicio rolServicio;
    private final RepositorioRol repositorioRol;

    public SeguridadConfig(JwtFilter jwtFilter, @Lazy UserDetailsService userDetailsService, RolServicio rolServicio, RepositorioRol repositorioRol, RepositorioRol repositorioRol1) {
        this.jwtFilter = jwtFilter;
        this.userDetailsService = userDetailsService;
        this.rolServicio = rolServicio;
        this.repositorioRol = repositorioRol1;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        List<String> permisosAdmin = rolServicio.obtenerPermisosPorRol("ADMIN");
        List<String> permisosUser = rolServicio.obtenerPermisosPorRol("USER");
        List<String> permisosGuest = rolServicio.obtenerPermisosPorRol("GUEST");
        List<String> permisosModerator = rolServicio.obtenerPermisosPorRol("MODERATOR");

        System.out.println("📌 Rutas protegidas con permisos:");
        for (String permiso : permisosAdmin) {
            System.out.println("✅ ADMIN puede acceder a: " + permiso);
        }
        for (String permiso : permisosUser) {
            System.out.println("✅ USER puede acceder a: " + permiso);
        }
        for (String permiso : permisosGuest) {
            System.out.println("✅ GUEST puede acceder a: " + permiso);
        }
        for (String permiso : permisosModerator) {
            System.out.println("✅ MODERATOR puede acceder a: " + permiso);
        }

        http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> {
                    // Permitir acceso público al login y registro
                    auth.requestMatchers(HttpMethod.POST, "/usuarios/login").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/usuarios/registro").permitAll();

                    // Proteger rutas según los permisos
                    for (String permiso : permisosAdmin) {
                        auth.requestMatchers("/seguridad/admin/**").hasAuthority(permiso);
                    }
                    for (String permiso : permisosUser) {
                        auth.requestMatchers("/seguridad/usuarios/**").hasAuthority(permiso);
                    }
                    for (String permiso : permisosGuest) {
                        auth.requestMatchers("/seguridad/publico/**").hasAuthority(permiso);
                    }
                    for (String permiso : permisosModerator) {
                        auth.requestMatchers("/seguridad/moderacion/**").hasAuthority(permiso);
                    }

                    auth.anyRequest().authenticated();
                })
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
