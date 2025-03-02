package com.BsltProject.Controladores;

import com.BsltProject.Modelos.PermisosRoles;
import com.BsltProject.Modelos.Rol;
import com.BsltProject.Servicios.PermisosRolesServicio;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
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

    @PutMapping("/asignar-multiples/{rolId}")
    public ResponseEntity<Rol> asignarPermisosARol(@PathVariable String rolId, @RequestBody Map<String, List<String>> request) {
        List<String> permisos = request.get("permisos");
        Rol rolActualizado = permisosRolesServicio.asignarMultiplesPermisosARol(rolId, permisos);
        return ResponseEntity.ok(rolActualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPermisosRoles(@PathVariable String id) { // 🔹 Cambié Long por String
        permisosRolesServicio.eliminarPermisosRoles(id);
        return ResponseEntity.noContent().build();
    }
}
