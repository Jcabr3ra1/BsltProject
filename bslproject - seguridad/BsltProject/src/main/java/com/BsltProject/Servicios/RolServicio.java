package com.BsltProject.Servicios;

import com.BsltProject.Modelos.Rol;
import com.BsltProject.Modelos.Permiso;
import com.BsltProject.Modelos.Usuario;
import com.BsltProject.Repositorios.RepositorioRol;
import com.BsltProject.Repositorios.RepositorioPermiso;
import com.BsltProject.Repositorios.RepositorioUsuario;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RolServicio {

    private final RepositorioRol repositorioRol;
    private final RepositorioPermiso repositorioPermiso;
    private final RepositorioUsuario repositorioUsuario;

    public RolServicio(RepositorioRol repositorioRol, RepositorioPermiso repositorioPermiso, RepositorioUsuario repositorioUsuario) {
        this.repositorioRol = repositorioRol;
        this.repositorioPermiso = repositorioPermiso;
        this.repositorioUsuario = repositorioUsuario;
    }

    public Rol crearRol(Rol rol) {
        return repositorioRol.save(rol);
    }

    public List<Rol> obtenerTodosLosRoles() {
        return repositorioRol.findAll();
    }

    public Optional<Rol> obtenerRolPorId(String id) {
        return repositorioRol.findById(id);
    }

    public Optional<Rol> obtenerRolPorNombre(String nombre) {
        return repositorioRol.findByNombre(nombre);
    }

    public Rol actualizarRol(String id, Rol rolDetalles) {
        Rol rol = repositorioRol.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        rol.setNombre(rolDetalles.getNombre());

        return repositorioRol.save(rol);
    }

    public void eliminarRol(String id) {
        Rol rol = repositorioRol.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        repositorioRol.delete(rol);
    }

    // ✅ NUEVO: Obtener permisos de un rol
    public List<Permiso> obtenerPermisosDeRol(String id) {
        Rol rol = repositorioRol.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        return rol.getPermisos();
    }

    // ✅ NUEVO: Obtener usuarios con un rol
    public List<Usuario> obtenerUsuariosConRol(String id) {
        return repositorioUsuario.findByRolesId(id);
    }

    // ✅ NUEVO: Asignar un permiso a un rol
    public Rol asignarPermiso(String rolId, String permisoId) {
        Rol rol = repositorioRol.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        Permiso permiso = repositorioPermiso.findById(permisoId)
                .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));

        rol.getPermisos().add(permiso);
        return repositorioRol.save(rol);
    }

    // ✅ Obtener permisos de un usuario autenticado
    public List<String> obtenerPermisosPorRol(String nombreRol) {
        Optional<Rol> rol = repositorioRol.findByNombre(nombreRol);

        if (rol.isEmpty()) {
            System.out.println("⚠ No se encontró el rol: " + nombreRol);
            return List.of();
        }

        List<String> permisos = rol.get().getPermisos().stream()
                .map(Permiso::getNombre)
                .collect(Collectors.toList());

        System.out.println("✅ Permisos para el rol " + nombreRol + ": " + permisos);
        return permisos;
    }

}

