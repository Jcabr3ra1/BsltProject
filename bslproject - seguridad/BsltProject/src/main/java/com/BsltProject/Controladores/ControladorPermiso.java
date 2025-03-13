package com.BsltProject.Controladores;

import com.BsltProject.Modelos.Permiso;
import com.BsltProject.Servicios.PermisoServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/seguridad/permisos")
public class ControladorPermiso {

    private final PermisoServicio permisoServicio;

    public ControladorPermiso(PermisoServicio permisoServicio) {
        this.permisoServicio = permisoServicio;
    }

    // ✅ OBTENER TODOS LOS PERMISOS
    @GetMapping
    public ResponseEntity<List<Permiso>> obtenerTodosLosPermisos() {
        return ResponseEntity.ok(permisoServicio.obtenerTodosLosPermisos());
    }

    // ✅ OBTENER UN PERMISO POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Permiso> obtenerPermisoPorId(@PathVariable String id) {
        Optional<Permiso> permiso = permisoServicio.obtenerPermisoPorId(id);
        return permiso.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ OBTENER UN PERMISO POR NOMBRE
    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<Permiso> obtenerPermisoPorNombre(@PathVariable String nombre) {
        Optional<Permiso> permiso = permisoServicio.obtenerPermisoPorNombre(nombre);
        return permiso.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ CREAR UN NUEVO PERMISO
    @PostMapping
    public ResponseEntity<Permiso> crearPermiso(@RequestBody Permiso permiso) {
        return ResponseEntity.ok(permisoServicio.crearPermiso(permiso));
    }

    // ✅ ACTUALIZAR UN PERMISO
    @PutMapping("/{id}")
    public ResponseEntity<Permiso> actualizarPermiso(@PathVariable String id, @RequestBody Permiso permisoDetalles) {
        Permiso permisoActualizado = permisoServicio.actualizarPermiso(id, permisoDetalles);
        return ResponseEntity.ok(permisoActualizado);
    }

    // ✅ ELIMINAR UN PERMISO
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPermiso(@PathVariable String id) {
        permisoServicio.eliminarPermiso(id);
        return ResponseEntity.noContent().build();
    }
}
