package com.BsltProject.Configuracion;

import com.BsltProject.Modelos.Estado;
import com.BsltProject.Modelos.Rol;
import com.BsltProject.Modelos.Usuario;
import com.BsltProject.Repositorios.RepositorioEstado;
import com.BsltProject.Repositorios.RepositorioRol;
import com.BsltProject.Repositorios.RepositorioUsuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
public class InicializadorDatos implements CommandLineRunner {

    private final RepositorioUsuario repositorioUsuario;
    private final RepositorioRol repositorioRol;
    private final RepositorioEstado repositorioEstado;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public InicializadorDatos(
            RepositorioUsuario repositorioUsuario,
            RepositorioRol repositorioRol,
            RepositorioEstado repositorioEstado,
            PasswordEncoder passwordEncoder) {
        this.repositorioUsuario = repositorioUsuario;
        this.repositorioRol = repositorioRol;
        this.repositorioEstado = repositorioEstado;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Inicializando datos...");
        
        inicializarEstados();
        inicializarRoles();
        
        // Comentamos temporalmente la creación de usuarios para evitar el error
        // crearUsuarioPrueba();
        
        System.out.println("Datos inicializados correctamente");
    }

    private void inicializarEstados() {
        if (repositorioEstado.count() == 0) {
            System.out.println("Inicializando estados...");
            
            Estado activo = new Estado();
            activo.setNombre("ACTIVO");
            repositorioEstado.save(activo);
            
            Estado inactivo = new Estado();
            inactivo.setNombre("INACTIVO");
            repositorioEstado.save(inactivo);
            
            Estado bloqueado = new Estado();
            bloqueado.setNombre("BLOQUEADO");
            repositorioEstado.save(bloqueado);
            
            System.out.println("Estados inicializados correctamente");
        }
    }

    private void inicializarRoles() {
        if (repositorioRol.count() == 0) {
            System.out.println("Inicializando roles...");
            
            Rol admin = new Rol("ADMIN");
            repositorioRol.save(admin);
            
            Rol user = new Rol("USER");
            repositorioRol.save(user);
            
            System.out.println("Roles inicializados correctamente");
        }
    }

    // Comentamos el método que causa el problema
    /*
    private void crearUsuarioPrueba() {
        Optional<Usuario> usuarioExistente = repositorioUsuario.findByEmail("admin@bsltproject.com");
        
        if (!usuarioExistente.isPresent()) {
            System.out.println("Creando usuario de prueba...");
            
            // Obtener estado activo
            Optional<Estado> estadoActivo = repositorioEstado.findByNombre("ACTIVO");
            if (!estadoActivo.isPresent()) {
                System.out.println("Error: Estado 'ACTIVO' no encontrado");
                return;
            }
            
            // Obtener rol admin
            Optional<Rol> rolAdmin = repositorioRol.findByNombre("ADMIN");
            if (!rolAdmin.isPresent()) {
                System.out.println("Error: Rol 'ADMIN' no encontrado");
                return;
            }
            
            // Crear usuario
            Usuario admin = new Usuario();
            admin.setNombre("Administrador");
            admin.setEmail("admin@bsltproject.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEstado(estadoActivo.get());
            
            Set<Rol> roles = new HashSet<>();
            roles.add(rolAdmin.get());
            admin.setRoles(roles);
            
            repositorioUsuario.save(admin);
            
            System.out.println("Usuario de prueba creado correctamente");
        }
    }
    */
}
