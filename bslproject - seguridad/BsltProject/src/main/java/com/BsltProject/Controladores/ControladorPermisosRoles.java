package com.BsltProject.Controladores;

import com.BsltProject.Modelos.PermisosRoles;
import com.BsltProject.Servicios.PermisosRolesServicio;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/permisos-roles")
public class ControladorPermisosRoles {

    private final PermisosRolesServicio permisosRolesServicio;

    public ControladorPermisosRoles(PermisosRolesServicio permisosRolesServicio) {
        this.permisosRolesServicio = permisosRolesServicio;
    }

    @PostMapping
    public ResponseEntity<PermisosRoles> crearPermisosRoles(@RequestBody PermisosRoles permisosRoles) {
        return ResponseEntity.ok(permisosRolesServicio.crearPermisosRoles(permisosRoles));
    }

    @GetMapping
    public ResponseEntity<List<PermisosRoles>> obtenerTodosLosPermisosRoles() {
        return ResponseEntity.ok(permisosRolesServicio.obtenerTodosLosPermisosRoles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PermisosRoles> obtenerPermisosRolesPorId(@PathVariable String id) { // 🔹 Cambié Long por String
        Optional<PermisosRoles> permisosRoles = permisosRolesServicio.obtenerPermisosRolesPorId(id);
        return permisosRoles.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/asignar/{rolId}/{permisoId}")
    public ResponseEntity<PermisosRoles> asignarPermisoARol(@PathVariable String rolId, @PathVariable String permisoId) { // 🔹 Cambié Long por String
        return ResponseEntity.ok(permisosRolesServicio.asignarPermisoARol(rolId, permisoId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPermisosRoles(@PathVariable String id) { // 🔹 Cambié Long por String
        permisosRolesServicio.eliminarPermisosRoles(id);
        return ResponseEntity.noContent().build();
    }
}
