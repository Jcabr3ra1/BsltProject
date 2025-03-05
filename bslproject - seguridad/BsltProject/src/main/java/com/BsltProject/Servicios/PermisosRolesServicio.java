package com.BsltProject.Servicios;

import com.BsltProject.Modelos.PermisosRoles;
import com.BsltProject.Modelos.Permiso;
import com.BsltProject.Modelos.Rol;
import com.BsltProject.Repositorios.RepositorioPermisosRoles;
import com.BsltProject.Repositorios.RepositorioPermiso;
import com.BsltProject.Repositorios.RepositorioRol;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PermisosRolesServicio {

    private final RepositorioPermisosRoles repositorioPermisosRoles;
    private final RepositorioRol repositorioRol;
    private final RepositorioPermiso repositorioPermiso;

    public PermisosRolesServicio(RepositorioPermisosRoles repositorioPermisosRoles,
                                 RepositorioRol repositorioRol,
                                 RepositorioPermiso repositorioPermiso) {
        this.repositorioPermisosRoles = repositorioPermisosRoles;
        this.repositorioRol = repositorioRol;
        this.repositorioPermiso = repositorioPermiso;
    }

    public PermisosRoles crearPermisosRoles(String rolId, String permisoId) {
        Rol rol = repositorioRol.findById(rolId)
                .orElseThrow(() -> new RuntimeException("❌ Error: El rol no existe."));

        Permiso permiso = repositorioPermiso.findById(permisoId)
                .orElseThrow(() -> new RuntimeException("❌ Error: El permiso no existe."));

        // 🔹 Verificar si el permiso ya está asignado al rol
        if (rol.getPermisos().contains(permiso)) {
            throw new RuntimeException("❌ Error: El permiso ya está asignado a este rol.");
        }

        // 🔹 Agregar el permiso a la lista de permisos del rol
        rol.getPermisos().add(permiso);
        repositorioRol.save(rol); // 🔹 Guardar cambios en el rol

        // 🔹 Crear la relación PermisosRoles y asignar el permiso correctamente
        PermisosRoles permisosRoles = new PermisosRoles();
        permisosRoles.setRol(rol);
        permisosRoles.setPermiso(permiso);  // ✅ Ahora se asigna correctamente el permiso
        permisosRoles.setId(new ObjectId().toString()); // Generar ID manualmente si no se usa @Id automático

        return repositorioPermisosRoles.save(permisosRoles);
    }

    public List<PermisosRoles> obtenerTodosLosPermisosRoles() {
        List<PermisosRoles> permisosRolesList = repositorioPermisosRoles.findAll();
        for (PermisosRoles pr : permisosRolesList) {
            if (pr.getRol() == null || pr.getPermiso() == null) {
                System.out.println("⚠️ Advertencia: Se encontró un PermisosRoles sin rol o permiso - ID: " + pr.getId());
            }
        }
        return permisosRolesList;
    }

    public Optional<PermisosRoles> obtenerPermisosRolesPorId(String id) { // 🔹 Cambié Long por String
        return repositorioPermisosRoles.findById(id);
    }

    public Rol asignarMultiplesPermisosARol(String rolId, List<String> permisosNombres) {
        Rol rol = repositorioRol.findById(rolId)
                .orElseThrow(() -> new RuntimeException("❌ Error: No se encontró el rol con ID: " + rolId));

        List<Permiso> permisos = repositorioPermiso.findByNombreIn(permisosNombres);
        if (permisos.isEmpty()) {
            throw new RuntimeException("❌ Error: No se encontraron permisos con esos nombres.");
        }

        if (rol.getPermisos() == null) {
            rol.setPermisos(new ArrayList<>()); // 🔹 Inicializar si es null
        }

        rol.getPermisos().addAll(permisos); // 🔹 Ahora no habrá NullPointerException
        return repositorioRol.save(rol);
    }

    public void eliminarPermisosRoles(String id) { // 🔹 Cambié Long por String
        PermisosRoles permisosRoles = repositorioPermisosRoles.findById(id)
                .orElseThrow(() -> new RuntimeException("PermisosRoles no encontrado"));
        repositorioPermisosRoles.delete(permisosRoles);
    }
}
