package com.agendapets.agendapets.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "correo", nullable = false, unique = true, length = 150)
    private String correo;

    @Column(name = "contrasena", nullable = false, length = 255)
    private String contrasena;

    @Column(name = "estado")
    @Builder.Default
    private Boolean estado = true;

    @Column(name = "rol", nullable = false, length = 20)
    @Builder.Default
    private String rol = "CLIENTE";

    @JsonIgnore
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Mascota> mascotas = new ArrayList<>();
}
