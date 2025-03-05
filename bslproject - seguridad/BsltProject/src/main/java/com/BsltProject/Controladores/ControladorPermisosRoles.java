package com.BsltProject.Controladores;

import com.BsltProject.Modelos.Permiso;
import com.BsltProject.Modelos.PermisosRoles;
import com.BsltProject.Modelos.Rol;
import com.BsltProject.Servicios.PermisosRolesServicio;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/permisos-roles")
public class ControladorPermisosRoles {

    private final PermisosRolesServicio permisosRolesServicio;

    public ControladorPermisosRoles(PermisosRolesServicio permisosRolesServicio) {
        this.permisosRolesServicio = permisosRolesServicio;
    }

    @PostMapping
    public ResponseEntity<?> crearPermisosRoles(@RequestBody Map<String, String> request) {
        String rolId = request.get("rolId");
        String permisoId = request.get("permisoId");

        if (rolId == null || permisoId == null || rolId.isEmpty() || permisoId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "❌ Error: rolId y permisoId son requeridos"));
        }

        try {
            PermisosRoles nuevoPermisoRol = permisosRolesServicio.crearPermisosRoles(rolId, permisoId);
            return ResponseEntity.ok(nuevoPermisoRol);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> obtenerPermisosRoles() {
        List<PermisosRoles> permisosRolesList = permisosRolesServicio.obtenerTodosLosPermisosRoles();
        List<Map<String, Object>> respuesta = new ArrayList<>();

        for (PermisosRoles permisosRoles : permisosRolesList) {
            if (permisosRoles.getRol() == null) {
                System.out.println("❌ Error: PermisosRoles sin Rol asociado - ID: " + permisosRoles.getId());
                continue; // Saltar registros que no tienen rol
            }

            if (permisosRoles.getPermiso() == null) {
                System.out.println("❌ Error: PermisosRoles sin Permiso asociado - ID: " + permisosRoles.getId());
                continue; // Saltar registros que no tienen permiso
            }

            Map<String, Object> rolData = new HashMap<>();
            rolData.put("id", permisosRoles.getRol().getId());
            rolData.put("nombre", permisosRoles.getRol().getNombre());
            rolData.put("permisos", permisosRoles.getRol().getPermisos());

            Map<String, Object> permisosRolesData = new HashMap<>();
            permisosRolesData.put("id", permisosRoles.getId());
            permisosRolesData.put("rol", rolData);
            permisosRolesData.put("permiso", permisosRoles.getPermiso());

            respuesta.add(permisosRolesData);
        }

        return ResponseEntity.ok(respuesta);
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
