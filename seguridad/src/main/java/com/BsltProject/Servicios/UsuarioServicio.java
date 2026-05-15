package com.BsltProject.Servicios;

import com.BsltProject.Modelos.Usuario;
import com.BsltProject.Modelos.Rol;
import com.BsltProject.Modelos.Estado;
import com.BsltProject.Modelos.Permiso; 
import com.BsltProject.Repositorios.RepositorioUsuario;
import com.BsltProject.Repositorios.RepositorioRol;
import com.BsltProject.Repositorios.RepositorioEstado;
import com.BsltProject.Repositorios.RepositorioPermiso; 
import com.BsltProject.Seguridad.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UsuarioServicio {

    private final RepositorioUsuario repositorioUsuario;
    private final RepositorioRol repositorioRol;
    private final RepositorioEstado repositorioEstado;
    private final RepositorioPermiso repositorioPermiso; 
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UsuarioServicio(RepositorioUsuario repositorioUsuario,
                           RepositorioRol repositorioRol,
                           RepositorioEstado repositorioEstado,
                           RepositorioPermiso repositorioPermiso, 
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil) {
        this.repositorioUsuario = repositorioUsuario;
        this.repositorioRol = repositorioRol;
        this.repositorioEstado = repositorioEstado;
        this.repositorioPermiso = repositorioPermiso; 
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public Usuario crearUsuario(Usuario usuario) {

        
        Optional<Usuario> usuarioExistente = repositorioUsuario.findByEmail(usuario.getEmail());
        if (usuarioExistente.isPresent()) {
            throw new RuntimeException("Ya existe un usuario registrado con ese correo electrónico.");
        }

        
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

        
        if (usuario.getRoles() == null || usuario.getRoles().isEmpty()) {
            Optional<Rol> rolUser = repositorioRol.findByNombre("USER");
            rolUser.ifPresent(rol -> usuario.getRoles().add(rol));
        }

        
        if (usuario.getEstado() == null) {
            Optional<Estado> estadoActivo = repositorioEstado.findByNombre("ACTIVO");
            estadoActivo.ifPresent(usuario::setEstado);
        }

        return repositorioUsuario.save(usuario);
    }

    public List<Usuario> obtenerTodosLosUsuarios() {
        List<Usuario> usuarios = repositorioUsuario.findAll();
        String backendFinancieroURL = "http://localhost:9999/finanzas/cuentas/"; 
        RestTemplate restTemplate = new RestTemplate();

        
        usuarios.parallelStream().forEach(usuario -> {
            if (usuario.getCuentaId() != null && !usuario.getCuentaId().isEmpty()) {
                try {
                    ResponseEntity<Map> respuesta = restTemplate.getForEntity(backendFinancieroURL + usuario.getCuentaId(), Map.class);

                    if (respuesta.getStatusCode().is2xxSuccessful() && respuesta.getBody() != null) {
                        usuario.setCuenta(respuesta.getBody()); 
                    } else {
                        usuario.setCuenta(Map.of("error", "Cuenta no encontrada"));
                    }
                } catch (Exception e) {
                    usuario.setCuenta(Map.of("error", "No se pudo conectar con Finanzas"));
                }
            } else {
                usuario.setCuenta(Map.of("mensaje", "El usuario no tiene una cuenta asignada"));
            }
        });

        return usuarios;
    }

    public Optional<Usuario> obtenerUsuarioPorId(String usuarioId) {
        Optional<Usuario> usuarioOptional = repositorioUsuario.findById(usuarioId);
        if (!usuarioOptional.isPresent()) {
            return Optional.empty();
        }

        Usuario usuario = usuarioOptional.get();

        
        if (usuario.getCuentaId() != null && !usuario.getCuentaId().isEmpty()) {
            String urlCuenta = "http://localhost:9999/finanzas/cuentas/" + usuario.getCuentaId();  
            RestTemplate restTemplate = new RestTemplate();

            try {

                ResponseEntity<Map> respuesta = restTemplate.getForEntity(urlCuenta, Map.class);

                if (respuesta.getStatusCode().is2xxSuccessful()) {
                    usuario.setCuenta(respuesta.getBody()); 
                } else {
                    usuario.setCuenta(Map.of("error", "No se pudo obtener la cuenta"));
                }
            } catch (Exception e) {
                usuario.setCuenta(Map.of("error", "No se pudo conectar con Finanzas"));
            }
        } else {
            usuario.setCuenta(Map.of("mensaje", "El usuario no tiene una cuenta asignada"));
        }

        return Optional.of(usuario);
    }

    public Optional<Usuario> obtenerUsuarioPorEmail(String email) {
        return repositorioUsuario.findByEmail(email);
    }

    public Usuario actualizarUsuario(String id, Usuario usuarioDetalles) {
        Usuario usuario = repositorioUsuario.findById(String.valueOf(id))
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setNombre(usuarioDetalles.getNombre());
        usuario.setApellido(usuarioDetalles.getApellido()); 
        usuario.setEmail(usuarioDetalles.getEmail());

        if (usuarioDetalles.getPassword() != null && !usuarioDetalles.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(usuarioDetalles.getPassword()));
        }

        
        if (usuarioDetalles.getRoles() != null && !usuarioDetalles.getRoles().isEmpty()) {
            Set<Rol> nuevosRoles = new HashSet<>();
            for (Rol rol : usuarioDetalles.getRoles()) {
                Rol rolExistente = repositorioRol.findById(rol.getId())
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + rol.getId()));
                nuevosRoles.add(rolExistente);
            }
            usuario.setRoles(nuevosRoles);
        }

        
        if (usuarioDetalles.getEstado() != null) {
            Estado estadoExistente = repositorioEstado.findById(usuarioDetalles.getEstado().getId())
                    .orElseThrow(() -> new RuntimeException("Estado no encontrado: " + usuarioDetalles.getEstado().getId()));
            usuario.setEstado(estadoExistente);
        }

        return repositorioUsuario.save(usuario);
    }

    public void desasociarCuenta(String userId, String cuentaId) {
        Optional<Usuario> optionalUsuario = repositorioUsuario.findById(userId);
        if (optionalUsuario.isPresent()) {
            Usuario usuario = optionalUsuario.get();
            if (cuentaId.equals(usuario.getCuentaId())) {
                usuario.setCuentaId(null); 
                repositorioUsuario.save(usuario);
            }
        } else {
            throw new RuntimeException("Usuario no encontrado para desasociar cuenta");
        }
    }
    public boolean eliminar(String idUsuario) {
        Optional<Usuario> optionalUsuario = repositorioUsuario.findById(idUsuario);

        if (optionalUsuario.isPresent()) {
            Usuario usuario = optionalUsuario.get();

            
            if (usuario.getCuentaId() != null) {
                try {
                    String cuentaId = usuario.getCuentaId();
                    String urlFinanzas = "http://localhost:9999/finanzas/cuentas/" + cuentaId;

                    HttpClient client = HttpClient.newHttpClient();
                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create(urlFinanzas))
                            .DELETE()
                            .build();

                    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                } catch (Exception e) {
                }
            }

            
            repositorioUsuario.deleteById(idUsuario);
            return true;
        }

        return false;
    }

    public Usuario asignarRol(String usuarioId, String rolId) {
        Usuario usuario = repositorioUsuario.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Rol rol = repositorioRol.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        
        Set<Rol> nuevosRoles = new HashSet<>();
        nuevosRoles.add(rol);

        
        usuario.setRoles(nuevosRoles);

        usuario = repositorioUsuario.save(usuario);

        
        List<String> roles = usuario.getRoles().stream().map(Rol::getNombre).collect(Collectors.toList());
        String nuevoToken = jwtUtil.generarToken(usuario.getEmail(), roles);


        return usuario;
    }


    public Usuario asignarEstado(String usuarioId, String estadoId) {
        Usuario usuario = repositorioUsuario.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Estado estado = repositorioEstado.findById(estadoId)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado"));

        usuario.setEstado(estado); 
        return repositorioUsuario.save(usuario);
    }

    public Usuario asignarCuentaAUsuario(String usuarioId, String cuentaId) {

        Optional<Usuario> cuentaAsignada = repositorioUsuario.findByCuentaId(cuentaId);
        if (cuentaAsignada.isPresent() && !usuarioId.equals(cuentaAsignada.get().getId())) {
            throw new RuntimeException("La cuenta ya está asignada a otro usuario con ID: " + cuentaAsignada.get().getId());
        }

        Optional<Usuario> usuarioOpt = repositorioUsuario.findById(usuarioId);

        if (!usuarioOpt.isPresent()) {
            List<Usuario> todosUsuarios = repositorioUsuario.findAll();
            for (Usuario u : todosUsuarios) {
                if (u.getId() != null &&
                        (u.getId().equalsIgnoreCase(usuarioId) ||
                                u.getId().contains(usuarioId) ||
                                usuarioId.contains(u.getId()))) {
                    usuarioOpt = Optional.of(u);
                    break;
                }
            }
        }

        if (!usuarioOpt.isPresent()) {
            throw new RuntimeException("Usuario no encontrado con ID: " + usuarioId);
        }

        Usuario usuario = usuarioOpt.get();

        usuario.setCuentaId(cuentaId); 
        Usuario usuarioActualizado = repositorioUsuario.save(usuario);

        
        Usuario usuarioVerificado = repositorioUsuario.findById(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Error al verificar usuario"));

        if (usuarioVerificado.getCuentaId() == null || !usuarioVerificado.getCuentaId().equals(cuentaId)) {
            throw new RuntimeException("Error al asignar cuenta en Seguridad");
        }

        return usuarioActualizado;
    }

}
