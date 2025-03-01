package com.BsltProject.Servicios;

import com.BsltProject.Modelos.Usuario;
import com.BsltProject.Modelos.Rol;
import com.BsltProject.Modelos.Estado;
import com.BsltProject.Repositorios.RepositorioUsuario;
import com.BsltProject.Repositorios.RepositorioRol;
import com.BsltProject.Repositorios.RepositorioEstado;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioServicio {

    private final RepositorioUsuario repositorioUsuario;
    private final RepositorioRol repositorioRol;
    private final RepositorioEstado repositorioEstado;
    private final PasswordEncoder passwordEncoder; // ✅ Inyectamos el PasswordEncoder

    public UsuarioServicio(RepositorioUsuario repositorioUsuario,
                           RepositorioRol repositorioRol,
                           RepositorioEstado repositorioEstado,
                           PasswordEncoder passwordEncoder) { // ✅ Agregamos PasswordEncoder en el constructor
        this.repositorioUsuario = repositorioUsuario;
        this.repositorioRol = repositorioRol;
        this.repositorioEstado = repositorioEstado;
        this.passwordEncoder = passwordEncoder; // ✅ Guardamos la referencia del PasswordEncoder
    }

    public Usuario crearUsuario(Usuario usuario) {
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword())); // Encripta la contraseña antes de guardarla
        return repositorioUsuario.save(usuario);
    }

    public List<Usuario> obtenerTodosLosUsuarios() {
        return repositorioUsuario.findAll();
    }

    public Optional<Usuario> obtenerUsuarioPorId(String id) {
        return repositorioUsuario.findById(id);
    }

    public Optional<Usuario> obtenerUsuarioPorEmail(String email) {
        return repositorioUsuario.findByEmail(email);
    }

    public Usuario actualizarUsuario(String id, Usuario usuarioDetalles) {
        Usuario usuario = repositorioUsuario.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setNombre(usuarioDetalles.getNombre());
        usuario.setEmail(usuarioDetalles.getEmail());
        usuario.setPassword(passwordEncoder.encode(usuarioDetalles.getPassword())); // ✅ Encriptamos la nueva contraseña

        return repositorioUsuario.save(usuario);
    }

    public void eliminarUsuario(String id) {
        Usuario usuario = repositorioUsuario.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        repositorioUsuario.delete(usuario);
    }

    public Usuario asignarRol(String usuarioId, String rolId) {
        Usuario usuario = repositorioUsuario.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Rol rol = repositorioRol.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        if (usuario.getRoles() == null) {
            usuario.setRoles(new HashSet<>()); // Inicializa el conjunto si es nulo
        }

        usuario.getRoles().add(rol);
        return repositorioUsuario.save(usuario);
    }

    public Usuario asignarEstado(String usuarioId, String estadoId) {
        Usuario usuario = repositorioUsuario.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Estado estado = repositorioEstado.findById(estadoId)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado"));

        usuario.setEstado(estado); // Asigna el estado al usuario
        return repositorioUsuario.save(usuario);
    }


}
