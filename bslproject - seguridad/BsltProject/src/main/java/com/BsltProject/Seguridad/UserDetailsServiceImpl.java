package com.BsltProject.Seguridad;

import com.BsltProject.Modelos.Usuario;
import com.BsltProject.Repositorios.RepositorioUsuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final RepositorioUsuario repositorioUsuario;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserDetailsServiceImpl(RepositorioUsuario repositorioUsuario, @Lazy PasswordEncoder passwordEncoder) {
        this.repositorioUsuario = repositorioUsuario;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = repositorioUsuario.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        // Eliminamos todas las validaciones de estado
        // Cualquier usuario puede iniciar sesión independientemente de su estado

        System.out.println("DEBUG: Usuario encontrado - Email: " + usuario.getEmail());
        System.out.println("DEBUG: Contraseña en la base de datos: " + usuario.getPassword());

        return User.builder()
                .username(usuario.getEmail())
                .password(usuario.getPassword())
                .roles("USER")
                .build();
    }

    public UserDetails autenticarUsuario(String email, String password) {
        Usuario usuario = repositorioUsuario.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        System.out.println("DEBUG: Contraseña ingresada por el usuario: " + password);
        System.out.println("DEBUG: Contraseña encriptada almacenada: " + usuario.getPassword());
        System.out.println("DEBUG: Comparación de contraseña: " + passwordEncoder.matches(password, usuario.getPassword()));

        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw new BadCredentialsException("Credenciales incorrectas");
        }

        return loadUserByUsername(email);
    }

}
