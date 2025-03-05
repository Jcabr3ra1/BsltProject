package com.BsltProject.Controladores;

import com.BsltProject.Modelos.Rol;
import com.BsltProject.Modelos.Usuario;
import com.BsltProject.Seguridad.JwtUtil;
import com.BsltProject.Servicios.UsuarioServicio;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/usuarios")
public class ControladorUsuario {

    private final UsuarioServicio usuarioServicio;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public ControladorUsuario(UsuarioServicio usuarioServicio,
                              AuthenticationManager authenticationManager,
                              UserDetailsService userDetailsService,
                              JwtUtil jwtUtil,
                              PasswordEncoder passwordEncoder) {
        this.usuarioServicio = usuarioServicio;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    // ✅ REGISTRAR USUARIO
    @PostMapping("/registro")
    public ResponseEntity<Usuario> registrarUsuario(@RequestBody Usuario usuario) {
        Usuario nuevoUsuario = usuarioServicio.crearUsuario(usuario);
        return ResponseEntity.ok(nuevoUsuario);
    }

    // ✅ LOGIN (Genera Token JWT)
    @PostMapping("/login")
    public ResponseEntity<?> autenticarUsuario(@RequestBody Usuario usuario) {
        try {
            // Verificamos si el usuario existe en la base de datos
            Optional<Usuario> usuarioEncontrado = usuarioServicio.obtenerUsuarioPorEmail(usuario.getEmail());
            if (!usuarioEncontrado.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Credenciales incorrectas"));
            }

            // Obtenemos los detalles del usuario para Spring Security
            UserDetails userDetails = userDetailsService.loadUserByUsername(usuario.getEmail());

            if (passwordEncoder.matches(usuario.getPassword(), userDetails.getPassword())) {
                // 🔥 Extraer los roles del usuario
                List<String> rolesNombres = new ArrayList<>();
                if (usuarioEncontrado.get().getRoles() != null) {
                    for (Rol rol : usuarioEncontrado.get().getRoles()) {
                        rolesNombres.add(rol.getNombre());
                    }
                }

                // ✅ Generar token con los roles
                String token = jwtUtil.generarToken(userDetails.getUsername(), rolesNombres);

                // 🔥 Crear respuesta estructurada
                Map<String, Object> respuesta = new HashMap<>();
                respuesta.put("token", token);
                respuesta.put("tipo", "Bearer");
                respuesta.put("email", userDetails.getUsername());
                respuesta.put("nombre", usuarioEncontrado.get().getNombre());
                respuesta.put("roles", rolesNombres);

                // 🔥 Incluir información sobre el estado del usuario
                if (usuarioEncontrado.get().getEstado() != null) {
                    Map<String, Object> estadoInfo = new HashMap<>();
                    estadoInfo.put("id", usuarioEncontrado.get().getEstado().getId());
                    estadoInfo.put("nombre", usuarioEncontrado.get().getEstado().getNombre());
                    respuesta.put("estado", estadoInfo);
                } else {
                    respuesta.put("estado", null);
                }

                respuesta.put("mensaje", "Inicio de sesión exitoso");

                return ResponseEntity.ok(respuesta);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Credenciales incorrectas"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Credenciales incorrectas",
                            "detalle", e.getMessage()));
        }
    }

    // ✅ OBTENER TODOS LOS USUARIOS
    @GetMapping
    public ResponseEntity<List<Usuario>> obtenerTodosLosUsuarios() {
        List<Usuario> usuarios = usuarioServicio.obtenerTodosLosUsuarios();
        return ResponseEntity.ok(usuarios);
    }

    // ✅ OBTENER USUARIO POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerUsuarioPorId(@PathVariable String id) {
        Optional<Usuario> usuario = usuarioServicio.obtenerUsuarioPorId(id);
        return usuario.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ ACTUALIZAR USUARIO
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizarUsuario(@PathVariable String id, @RequestBody Usuario usuarioDetalles) {
        System.out.println("✅ Solicitud PUT recibida en el backend para ID: " + id);
        Usuario usuarioActualizado = usuarioServicio.actualizarUsuario(id, usuarioDetalles);
        return ResponseEntity.ok(usuarioActualizado);
    }

    // ✅ ELIMINAR USUARIO
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable String id) {
        usuarioServicio.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ ASIGNAR ROL A UN USUARIO
    @PutMapping("/{usuarioId}/asignar-rol/{rolId}")
    public ResponseEntity<Usuario> asignarRol(@PathVariable String usuarioId, @PathVariable String rolId) {
        Usuario usuarioActualizado = usuarioServicio.asignarRol(usuarioId, rolId);

        // 🔥 Generar nuevo token con los roles actualizados
        List<String> rolesNombres = new ArrayList<>();
        for (Rol rol : usuarioActualizado.getRoles()) {
            rolesNombres.add(rol.getNombre());
        }

        String nuevoToken = jwtUtil.generarToken(usuarioActualizado.getEmail(), rolesNombres);
        System.out.println("✅ Nuevo token generado tras asignación de rol: " + nuevoToken);

        return ResponseEntity.ok(usuarioActualizado);
    }

    // ✅ ASIGNAR ESTADO A UN USUARIO
    @PutMapping("/{usuarioId}/asignar-estado/{estadoId}")
    public ResponseEntity<Usuario> asignarEstado(@PathVariable String usuarioId, @PathVariable String estadoId) {
        Usuario usuarioActualizado = usuarioServicio.asignarEstado(usuarioId, estadoId);
        return ResponseEntity.ok(usuarioActualizado);
    }

    @PutMapping("/{usuarioId}/asignar-cuenta/{cuentaId}")
    public ResponseEntity<Usuario> asignarCuenta(@PathVariable String usuarioId, @PathVariable String cuentaId) {
        Usuario usuarioActualizado = usuarioServicio.asignarCuentaAUsuario(usuarioId, cuentaId);
        return ResponseEntity.ok(usuarioActualizado);
    }

}
