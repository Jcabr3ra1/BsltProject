package com.BsltProject.Servicios;

import com.BsltProject.Modelos.Rol;
import com.BsltProject.Modelos.Permiso;
import com.BsltProject.Modelos.Usuario;
import com.BsltProject.Repositorios.RepositorioRol;
import com.BsltProject.Repositorios.RepositorioPermiso;
import com.BsltProject.Repositorios.RepositorioUsuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RolServicio {

    private final RepositorioRol repositorioRol;
    private final RepositorioPermiso repositorioPermiso;
    private final RepositorioUsuario repositorioUsuario;

    @Autowired
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
        // Validación del ID
        if (id == null || id.trim().isEmpty()) {
            System.err.println("❌ ID de rol inválido en servicio: " + (id == null ? "null" : "vacío"));
            return Optional.empty();
        }

        return repositorioRol.findById(id);
    }

    public Optional<Rol> obtenerRolPorNombre(String nombre) {
        return repositorioRol.findByNombre(nombre);
    }

    public Rol actualizarRol(String id, Rol rolDetalles) {
        Rol rol = repositorioRol.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        rol.setNombre(rolDetalles.getNombre());

        // Si hay permisos en los detalles, actualizarlos también
        if (rolDetalles.getPermisos() != null && !rolDetalles.getPermisos().isEmpty()) {
            rol.setPermisos(rolDetalles.getPermisos());
        }

        return repositorioRol.save(rol);
    }

    public void eliminarRol(String id) {
        Rol rol = repositorioRol.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        repositorioRol.delete(rol);
    }

    public List<Permiso> obtenerPermisosDeRol(String id) {
        // Validación del ID
        if (id == null || id.trim().isEmpty()) {
            System.err.println("❌ ID de rol inválido: " + (id == null ? "null" : "vacío"));
            return Collections.emptyList();
        }

        // Buscar el rol por ID
        Optional<Rol> rolOptional = repositorioRol.findById(id);

        // Si no se encuentra el rol
        if (!rolOptional.isPresent()) {
            System.err.println("❌ Rol no encontrado con ID: " + id);
            return Collections.emptyList();
        }

        // Obtener el rol
        Rol rol = rolOptional.get();

        // Obtener permisos, asegurándose de que no sea nulo
        List<Permiso> permisos = rol.getPermisos();
        if (permisos == null) {
            permisos = new ArrayList<>();
        }

        // Filtrar permisos nulos (por si acaso)
        permisos = permisos.stream()
                .filter(p -> p != null)
                .collect(Collectors.toList());

        // Log detallado
        System.out.println("🔍 Rol encontrado: " + rol.getNombre());
        System.out.println("🔑 Permisos: Cantidad: " + permisos.size());

        return permisos;
    }



    public List<Usuario> obtenerUsuariosConRol(String id) {
        return repositorioUsuario.findByRolesId(id);
    }

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