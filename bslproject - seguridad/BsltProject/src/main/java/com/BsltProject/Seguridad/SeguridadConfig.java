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

        System.out.println(" Rutas protegidas con permisos:");

        http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> {
                    // Permitir acceso público al login y registro
                    auth.requestMatchers(HttpMethod.POST, "/usuarios/login").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/usuarios/registro").permitAll();
                    
                    // Permitir acceso público a los endpoints de autenticación
                    auth.requestMatchers("/autenticacion/**").permitAll();
                    auth.requestMatchers("/seguridad/autenticacion/**").permitAll();
                    
                    // Permisos dinámicos por rol
                    permisosAdmin.forEach(permiso -> auth.requestMatchers("/admin/**").hasAuthority(permiso));
                    permisosUser.forEach(permiso -> auth.requestMatchers("/usuarios/**").hasAuthority(permiso));
                    permisosGuest.forEach(permiso -> auth.requestMatchers("/publico/**").hasAuthority(permiso));
                    permisosModerator.forEach(permiso -> auth.requestMatchers("/moderacion/**").hasAuthority(permiso));

                    // Aplicar autenticación a todas las rutas necesarias
                    List<String> rutasProtegidas = List.of(
                            "/usuarios/**",
                            "/estados/**",
                            "/permisos/**",
                            "/permisos-roles/**",
                            "/roles/**"
                    );

                    rutasProtegidas.forEach(ruta -> auth.requestMatchers(ruta).authenticated());

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
