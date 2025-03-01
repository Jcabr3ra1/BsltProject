package com.BsltProject.Controladores;

import com.BsltProject.Modelos.Estado;
import com.BsltProject.Servicios.EstadoServicio;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/estados")
public class ControladorEstado {

    private final EstadoServicio estadoServicio;

    public ControladorEstado(EstadoServicio estadoServicio) {
        this.estadoServicio = estadoServicio;
    }

    @PostMapping
    public ResponseEntity<Estado> crearEstado(@RequestBody Estado estado) {
        return ResponseEntity.ok(estadoServicio.crearEstado(estado));
    }

    @GetMapping
    public ResponseEntity<List<Estado>> obtenerTodosLosEstados() {
        return ResponseEntity.ok(estadoServicio.obtenerTodosLosEstados());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Estado> obtenerEstadoPorId(@PathVariable String id) { // 🔹 Cambié Long por String
        Optional<Estado> estado = estadoServicio.obtenerEstadoPorId(id);
        return estado.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Estado> actualizarEstado(@PathVariable String id, @RequestBody Estado estadoDetalles) { // 🔹 Cambié Long por String
        Estado estadoActualizado = estadoServicio.actualizarEstado(id, estadoDetalles);
        return ResponseEntity.ok(estadoActualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEstado(@PathVariable String id) { // 🔹 Cambié Long por String
        estadoServicio.eliminarEstado(id);
        return ResponseEntity.noContent().build();
    }
}
