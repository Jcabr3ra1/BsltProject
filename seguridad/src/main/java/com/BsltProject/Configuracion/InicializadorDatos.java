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
        
        inicializarEstados();
        inicializarRoles();
        
        
        
        
    }

    private void inicializarEstados() {
        if (repositorioEstado.count() == 0) {
            
            Estado activo = new Estado();
            activo.setNombre("ACTIVO");
            repositorioEstado.save(activo);
            
            Estado inactivo = new Estado();
            inactivo.setNombre("INACTIVO");
            repositorioEstado.save(inactivo);
            
            Estado bloqueado = new Estado();
            bloqueado.setNombre("BLOQUEADO");
            repositorioEstado.save(bloqueado);
            
        }
    }

    private void inicializarRoles() {
        if (repositorioRol.count() == 0) {
            
            Rol admin = new Rol("ADMIN");
            repositorioRol.save(admin);
            
            Rol user = new Rol("USER");
            repositorioRol.save(user);
            
        }
    }

    
    
}
