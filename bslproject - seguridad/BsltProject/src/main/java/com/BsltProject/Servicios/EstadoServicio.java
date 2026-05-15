package com.BsltProject.Servicios;

import com.BsltProject.Modelos.Estado;
import com.BsltProject.Repositorios.RepositorioEstado;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EstadoServicio {

    private final RepositorioEstado repositorioEstado;

    public EstadoServicio(RepositorioEstado repositorioEstado) {
        this.repositorioEstado = repositorioEstado;
    }

    public List<Estado> obtenerTodosLosEstados() {
        return repositorioEstado.findAll();
    }

    public Optional<Estado> obtenerEstadoPorId(String id) {
        return repositorioEstado.findById(id);
    }

    public Estado crearEstado(Estado estado) {
        return repositorioEstado.save(estado);
    }

    public Estado actualizarEstado(String id, Estado estadoDetalles) {
        Estado estado = repositorioEstado.findById(id)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado"));

        estado.setNombre(estadoDetalles.getNombre());
        return repositorioEstado.save(estado);
    }

    public void eliminarEstado(String id) {
        Estado estado = repositorioEstado.findById(id)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado"));
        repositorioEstado.delete(estado);
    }
}
