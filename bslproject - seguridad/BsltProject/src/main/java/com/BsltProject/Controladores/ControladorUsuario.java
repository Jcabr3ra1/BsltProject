package com.BsltProject.Controladores;

import com.BsltProject.Modelos.Rol;
import com.BsltProject.Modelos.Usuario;
import com.BsltProject.Repositorios.RepositorioUsuario;
import com.BsltProject.Seguridad.JwtUtil;
import com.BsltProject.Servicios.UsuarioServicio;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/seguridad")
public class ControladorUsuario {

    private final UsuarioServicio usuarioServicio;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private RepositorioUsuario repositorioUsuario;

    public ControladorUsuario(UsuarioServicio usuarioServicio,
                              AuthenticationManager authenticationManager,
                              JwtUtil jwtUtil,
                              PasswordEncoder passwordEncoder,
                              RepositorioUsuario repositorioUsuario) {
        this.usuarioServicio = usuarioServicio;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.repositorioUsuario = repositorioUsuario;
    }

    @PostMapping("/autenticacion/registro")
    public ResponseEntity<Usuario> registrarUsuario(@RequestBody Usuario usuario) {
        System.out.println("DEBUG - Controlador: Datos de registro recibidos:");
        System.out.println("Email: " + usuario.getEmail());
        System.out.println("Nombre: " + usuario.getNombre());
        System.out.println("Apellido: " + usuario.getApellido());
        System.out.println("Datos completos: " + usuario.toString());
        
        Usuario nuevoUsuario = usuarioServicio.crearUsuario(usuario);
        return ResponseEntity.ok(nuevoUsuario);
    }

    @PostMapping("/autenticacion/login")
    public ResponseEntity<?> autenticarUsuario(@RequestBody Usuario usuario) {
        try {
            Optional<Usuario> usuarioEncontrado = usuarioServicio.obtenerUsuarioPorEmail(usuario.getEmail());
            if (!usuarioEncontrado.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Credenciales incorrectas"));
            }

            // Agregar logs para depuración
            System.out.println("DEBUG: Contraseña proporcionada: " + usuario.getPassword());
            System.out.println("DEBUG: Contraseña almacenada: " + usuarioEncontrado.get().getPassword());
            System.out.println("DEBUG: Resultado de comparación: " + passwordEncoder.matches(usuario.getPassword(), usuarioEncontrado.get().getPassword()));

            if (passwordEncoder.matches(usuario.getPassword(), usuarioEncontrado.get().getPassword())) {
                List<String> rolesNombres = new ArrayList<>();
                if (usuarioEncontrado.get().getRoles() != null) {
                    for (Rol rol : usuarioEncontrado.get().getRoles()) {
                        rolesNombres.add(rol.getNombre());
                    }
                }

                String token = jwtUtil.generarToken(usuarioEncontrado.get().getEmail(), rolesNombres);
                
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", usuarioEncontrado.get().getId());
                userData.put("email", usuarioEncontrado.get().getEmail());
                userData.put("nombre", usuarioEncontrado.get().getNombre());
                userData.put("roles", rolesNombres);

                if (usuarioEncontrado.get().getEstado() != null) {
                    Map<String, Object> estadoInfo = new HashMap<>();
                    estadoInfo.put("id", usuarioEncontrado.get().getEstado().getId());
                    estadoInfo.put("nombre", usuarioEncontrado.get().getEstado().getNombre());
                    userData.put("estado", estadoInfo);
                } else {
                    userData.put("estado", null);
                }

                Map<String, Object> respuesta = new HashMap<>();
                respuesta.put("token", token);
                respuesta.put("tipo", "Bearer");
                respuesta.put("user", userData);
                respuesta.put("mensaje", "Inicio de sesión exitoso");

                return ResponseEntity.ok(respuesta);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Credenciales incorrectas"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Credenciales incorrectas", "detalle", e.getMessage()));
        }
    }

    @PostMapping("/autenticacion/verificar-token")
    public ResponseEntity<?> verificarToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");

        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("isValid", false, "error", "Token no proporcionado"));
        }

        try {
            // Verificar el token
            Claims claims = jwtUtil.extraerTodosLosReclamos(token);
            String email = claims.getSubject();

            // Buscar el usuario
            Optional<Usuario> usuarioOpt = usuarioServicio.obtenerUsuarioPorEmail(email);
            if (!usuarioOpt.isPresent()) {
                return ResponseEntity.ok(Map.of("isValid", false));
            }

            Usuario usuario = usuarioOpt.get();

            return ResponseEntity.ok(Map.of(
                    "isValid", true,
                    "user", usuario
            ));
        } catch (ExpiredJwtException e) {
            return ResponseEntity.ok(Map.of("isValid", false, "error", "Token expirado"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("isValid", false, "error", e.getMessage()));
        }
    }
    
    @PostMapping("/cerrar-sesion")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Cierre de sesión exitoso"));
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<Usuario>> obtenerTodosLosUsuarios() {
        List<Usuario> usuarios = usuarioServicio.obtenerTodosLosUsuarios();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/usuarios/{id}")
    public ResponseEntity<Usuario> obtenerUsuarioPorId(@PathVariable String id) {
        Optional<Usuario> usuario = usuarioServicio.obtenerUsuarioPorId(id);
        return usuario.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable String id) {
        if (usuarioServicio.eliminar(id)) {
            return ResponseEntity.ok().body(Map.of("mensaje", "Usuario eliminado correctamente"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Usuario no encontrado"));
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<Usuario> actualizarUsuario(@PathVariable String id, @RequestBody Usuario usuarioDetalles) {
        Usuario usuarioActualizado = usuarioServicio.actualizarUsuario(id, usuarioDetalles);
        return ResponseEntity.ok(usuarioActualizado);
    }

    @GetMapping("/usuarios/email/{email}")
    public ResponseEntity<Usuario> obtenerUsuarioPorEmail(@PathVariable String email) {
        Optional<Usuario> usuario = usuarioServicio.obtenerUsuarioPorEmail(email);
        return usuario.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/usuarios/{userId}/roles/{roleId}")
    public ResponseEntity<Usuario> asignarRol(@PathVariable String userId, @PathVariable String roleId) {
        Usuario usuarioActualizado = usuarioServicio.asignarRol(userId, roleId);

        List<String> rolesNombres = new ArrayList<>();
        for (Rol rol : usuarioActualizado.getRoles()) {
            rolesNombres.add(rol.getNombre());
        }

        String nuevoToken = jwtUtil.generarToken(usuarioActualizado.getEmail(), rolesNombres);
        return ResponseEntity.ok(usuarioActualizado);
    }

    @PutMapping("/usuarios/{userId}/estados/{stateId}")
    public ResponseEntity<Usuario> asignarEstado(@PathVariable String userId, @PathVariable String stateId) {
        Usuario usuarioActualizado = usuarioServicio.asignarEstado(userId, stateId);
        return ResponseEntity.ok(usuarioActualizado);
    }

    @PutMapping("/usuarios/{userId}/cuentas/desasociar/{cuentaId}")
    public ResponseEntity<?> desasociarCuentaDeUsuario(
            @PathVariable String userId,
            @PathVariable String cuentaId
    ) {
        try {
            usuarioServicio.desasociarCuenta(userId, cuentaId);
            return ResponseEntity.ok().body(Map.of("mensaje", "Cuenta desasociada del usuario"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al desasociar cuenta del usuario", "detalle", e.getMessage()));
        }
    }


    @PutMapping("/usuarios/{userId}/cuentas/{accountId}")
    public ResponseEntity<Usuario> asignarCuenta(@PathVariable String userId, @PathVariable String accountId) {
        System.out.println("DEBUG - Recibida solicitud para asignar cuenta: " + accountId + " al usuario: " + userId);
        try {
            Usuario usuarioActualizado = usuarioServicio.asignarCuentaAUsuario(userId, accountId);
            System.out.println("DEBUG - Cuenta asignada correctamente. Usuario actualizado: " + usuarioActualizado);
            return ResponseEntity.ok(usuarioActualizado);
        } catch (Exception e) {
            System.err.println("ERROR - Fallo al asignar cuenta: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
}
