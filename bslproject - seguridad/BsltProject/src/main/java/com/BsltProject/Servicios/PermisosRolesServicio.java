package com.BsltProject.Servicios;

import com.BsltProject.Modelos.PermisosRoles;
import com.BsltProject.Modelos.Permiso;
import com.BsltProject.Modelos.Rol;
import com.BsltProject.Repositorios.RepositorioPermisosRoles;
import com.BsltProject.Repositorios.RepositorioPermiso;
import com.BsltProject.Repositorios.RepositorioRol;
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

    public PermisosRoles crearPermisosRoles(PermisosRoles permisosRoles) {
        return repositorioPermisosRoles.save(permisosRoles);
    }

    public List<PermisosRoles> obtenerTodosLosPermisosRoles() {
        return repositorioPermisosRoles.findAll();
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
