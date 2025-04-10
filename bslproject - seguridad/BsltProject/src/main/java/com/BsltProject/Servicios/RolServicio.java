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
        // Log detallado para seguimiento
        System.out.println("🔎 Buscando permisos para rol con ID: " + id);

        // Validación del ID
        if (!esIdValido(id)) {
            System.err.println("❌ ID de rol inválido o con formato incorrecto: " + id);
            return Collections.emptyList();
        }

        try {
            // Buscar el rol por ID
            Optional<Rol> rolOptional = repositorioRol.findById(id);

            // Si no se encuentra el rol
            if (!rolOptional.isPresent()) {
                System.err.println("❌ Rol no encontrado con ID: " + id);
                return Collections.emptyList();
            }

            // Obtener el rol
            Rol rol = rolOptional.get();
            System.out.println("✅ Rol encontrado: " + rol.getNombre());

            // Obtener permisos, asegurándose de que no sea nulo
            List<Permiso> permisos = rol.getPermisos();
            if (permisos == null) {
                System.out.println("ℹ️ El rol no tiene permisos asociados (null)");
                return new ArrayList<>();
            }

            // Filtrar permisos nulos (por si acaso)
            List<Permiso> permisosValidos = permisos.stream()
                    .filter(p -> p != null)
                    .collect(Collectors.toList());

            // Log detallado
            if (permisosValidos.isEmpty()) {
                System.out.println("ℹ️ El rol no tiene permisos asociados (lista vacía)");
            } else {
                System.out.println("🔑 Permisos encontrados: " + permisosValidos.size());
                permisosValidos.forEach(p -> System.out.println("  - " + p.getNombre()));
            }

            return permisosValidos;
        } catch (Exception e) {
            System.err.println("❌ Error al obtener permisos del rol: " + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    public Rol asignarPermiso(String roleId, String permissionId) {
        // Buscar el rol
        Rol rol = repositorioRol.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        // Buscar el permiso
        Permiso permiso = repositorioPermiso.findById(permissionId)
                .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));

        // Agregar el permiso al rol
        rol.agregarPermiso(permiso);

        // Guardar y devolver el rol actualizado
        return repositorioRol.save(rol);
    }

    public Rol eliminarPermiso(String roleId, String permissionId) {
        // Buscar el rol
        Rol rol = repositorioRol.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        // Buscar el permiso (opcional, solo para validación)
        Permiso permiso = repositorioPermiso.findById(permissionId)
                .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));

        // Eliminar el permiso del rol
        rol.eliminarPermisoPorId(permissionId);

        // Guardar y devolver el rol actualizado
        return repositorioRol.save(rol);
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

    /**
     * Valida si un ID tiene el formato correcto de ObjectId de MongoDB
     * @param id El ID a validar
     * @return true si el formato es válido, false en caso contrario
     */
    private boolean esIdValido(String id) {
        if (id == null || id.trim().isEmpty()) {
            return false;
        }

        // Patrón hexadecimal para ObjectId MongoDB (24 caracteres hexadecimales)
        String patronHex = "^[0-9a-fA-F]{24}$";

        return id.matches(patronHex);
    }
}