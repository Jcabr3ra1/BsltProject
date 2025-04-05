package com.BsltProject.Controladores;


import com.BsltProject.Modelos.Permiso;
import com.BsltProject.Modelos.Rol;
import com.BsltProject.Modelos.Usuario;
import com.BsltProject.Repositorios.RepositorioPermiso;
import com.BsltProject.Repositorios.RepositorioRol;
import com.BsltProject.Servicios.RolServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/seguridad/roles")
public class ControladorRol {

    private final RolServicio rolServicio;
    private final RepositorioRol repositorioRol;
    private final RepositorioPermiso repositorioPermiso;

    // Constructor con inyección de dependencia
    @Autowired
    public ControladorRol(
            RolServicio rolServicio,
            RepositorioRol repositorioRol,
            RepositorioPermiso repositorioPermiso
    ) {
        this.rolServicio = rolServicio;
        this.repositorioRol = repositorioRol;
        this.repositorioPermiso = repositorioPermiso;
    }

    // CREAR ROL
    @PostMapping
    public ResponseEntity<?> crearRol(@RequestBody Rol rol) {
        try {
            Rol nuevoRol = rolServicio.crearRol(rol);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoRol);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al crear el rol", "detalle", e.getMessage()));
        }
    }

    // OBTENER TODOS LOS ROLES
    @GetMapping
    public ResponseEntity<List<Rol>> obtenerTodosLosRoles() {
        return ResponseEntity.ok(rolServicio.obtenerTodosLosRoles());
    }

    // OBTENER ROL POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Rol> obtenerRolPorId(@PathVariable String id) {
        Optional<Rol> rol = rolServicio.obtenerRolPorId(id);
        return rol.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // OBTENER ROL POR NOMBRE
    @GetMapping("/name/{name}")
    public ResponseEntity<Rol> obtenerRolPorNombre(@PathVariable String name) {
        Optional<Rol> rol = rolServicio.obtenerRolPorNombre(name);
        return rol.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ACTUALIZAR ROL
    @PutMapping("/{id}")
    public ResponseEntity<Rol> actualizarRol(@PathVariable String id, @RequestBody Rol rolDetalles) {
        try {
            Rol rolActualizado = rolServicio.actualizarRol(id, rolDetalles);
            return ResponseEntity.ok(rolActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ELIMINAR ROL
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRol(@PathVariable String id) {
        try {
            rolServicio.eliminarRol(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{roleId}/permisos/{permissionId}")
    public ResponseEntity<?> asignarPermisoARol(
            @PathVariable String roleId,
            @PathVariable String permissionId
    ) {
        try {
            // Log de depuración
            System.out.println("🔍 Asignando permiso");
            System.out.println("📌 ID de Rol: " + roleId);
            System.out.println("📋 ID de Permiso: " + permissionId);

            // Verificar existencia de rol y permiso antes de asignar
            Rol rol = repositorioRol.findById(roleId)
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

            Permiso permiso = repositorioPermiso.findById(permissionId)
                    .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));

            // Imprimir detalles de rol y permiso
            System.out.println("✅ Rol encontrado: " + rol.getNombre());
            System.out.println("✅ Permiso encontrado: " + permiso.getNombre());

            // Utilizar el servicio para asignar el permiso
            Rol rolActualizado = rolServicio.asignarPermiso(roleId, permissionId);

            // Respuesta detallada
            return ResponseEntity.ok().body(Map.of(
                    "mensaje", "Permiso asignado exitosamente",
                    "rol", rolActualizado.getNombre(),
                    "permisos", rolActualizado.getPermisos().size()
            ));

        } catch (Exception e) {
            // Log de error más detallado
            System.err.println("❌ Error al asignar permiso:");
            System.err.println("Tipo de error: " + e.getClass().getSimpleName());
            System.err.println("Mensaje: " + e.getMessage());
            e.printStackTrace();

            // Respuesta de error más informativa
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "No se pudo asignar el permiso",
                            "tipo_error", e.getClass().getSimpleName(),
                            "detalle", e.getMessage()
                    ));
        }
    }

    @DeleteMapping("/{roleId}/permisos/{permissionId}")
    public ResponseEntity<?> eliminarPermisoDeRol(
            @PathVariable String roleId,
            @PathVariable String permissionId
    ) {
        try {
            // Log de depuración
            System.out.println("🔍 Eliminando permiso");
            System.out.println("📌 ID de Rol: " + roleId);
            System.out.println("📋 ID de Permiso: " + permissionId);

            // Verificar existencia de rol y permiso antes de eliminar
            Rol rol = repositorioRol.findById(roleId)
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

            Permiso permiso = repositorioPermiso.findById(permissionId)
                    .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));

            // Imprimir detalles de rol y permiso
            System.out.println("✅ Rol encontrado: " + rol.getNombre());
            System.out.println("✅ Permiso encontrado: " + permiso.getNombre());

            // Utilizar el servicio para eliminar el permiso
            Rol rolActualizado = rolServicio.eliminarPermiso(roleId, permissionId);

            // Respuesta detallada
            return ResponseEntity.ok().body(Map.of(
                    "mensaje", "Permiso eliminado exitosamente",
                    "rol", rolActualizado.getNombre(),
                    "permisos_restantes", rolActualizado.getPermisos().size()
            ));

        } catch (Exception e) {
            // Log de error más detallado
            System.err.println("❌ Error al eliminar permiso:");
            System.err.println("Tipo de error: " + e.getClass().getSimpleName());
            System.err.println("Mensaje: " + e.getMessage());
            e.printStackTrace();

            // Respuesta de error más informativa
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "No se pudo eliminar el permiso",
                            "tipo_error", e.getClass().getSimpleName(),
                            "detalle", e.getMessage()
                    ));
        }
    }

    // Método de manejo de errores más robusto para obtener usuarios de un rol
    @GetMapping("/{id}/users")
    public ResponseEntity<?> obtenerUsuariosConRol(@PathVariable String id) {
        try {
            // Verificar primero si el rol existe
            Rol rol = repositorioRol.findById(id)
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

            List<Usuario> usuarios = rolServicio.obtenerUsuariosConRol(id);

            // Respuesta con más información
            return ResponseEntity.ok(Map.of(
                    "rol", rol.getNombre(),
                    "usuarios", usuarios,
                    "total_usuarios", usuarios.size()
            ));
        } catch (Exception e) {
            System.err.println("❌ Error al obtener usuarios: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "error", "No se pudieron obtener los usuarios",
                            "detalle", e.getMessage()
                    ));
        }
    }
}