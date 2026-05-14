import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Switch, ScrollView, Image, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { db } from "../FirebaseConfig";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query } from "firebase/firestore";

// IMPORTANTE: Asegúrate de que la ruta del archivo sea la correcta
import CamaraComponent from './CamaraComponent'; 

export default function PedidoCafeteria() {
  const [nombre, setNombre] = useState("");
  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [paraLlevar, setParaLlevar] = useState(false);
  
  const [pedidos, setPedidos] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "pedidos"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPedidos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const manejarGuardar = async () => {
    if (!nombre || !producto || !precio) return Alert.alert("Error", "Nombre, producto y precio obligatorios");

    try {
      if (editingId) {
        await updateDoc(doc(db, "pedidos", editingId), { nombre, producto, cantidad, precio, observaciones, paraLlevar });
        Alert.alert("Éxito", "Pedido actualizado");
        setEditingId(null);
      } else {
        await addDoc(collection(db, "pedidos"), { nombre, producto, cantidad, precio, observaciones, paraLlevar });
        Alert.alert("Éxito", "Pedido guardado");
      }
      limpiarFormulario();
    } catch (e) { Alert.alert("Error", e.message); }
  };

  const iniciarEdicion = (item) => {
    setEditingId(item.id);
    setNombre(item.nombre); setProducto(item.producto); setCantidad(item.cantidad);
    setPrecio(item.precio); setObservaciones(item.observaciones); setParaLlevar(item.paraLlevar);
  };

  const borrarPedido = async (id) => { await deleteDoc(doc(db, "pedidos", id)); };

  const limpiarFormulario = () => {
    setNombre(""); setProducto(""); setCantidad(""); setPrecio(""); setObservaciones(""); setParaLlevar(false); setEditingId(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png" }} style={styles.logo} />
      <Text style={styles.titulo}>{editingId ? "Editar Pedido" : "Nuevo Pedido"}</Text>

      <TextInput style={styles.input} placeholder="Nombre cliente" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Producto" value={producto} onChangeText={setProducto} />
      <TextInput style={styles.input} placeholder="Cantidad" value={cantidad} onChangeText={setCantidad} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Precio" value={precio} onChangeText={setPrecio} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Observaciones" value={observaciones} onChangeText={setObservaciones} />
      
      <View style={styles.row}>
        <Text>¿Para llevar?</Text>
        <Switch value={paraLlevar} onValueChange={setParaLlevar} />
      </View>

      {/* Botón de Guardar/Actualizar */}
      <Button title={editingId ? "Actualizar Pedido" : "Guardar Pedido"} onPress={manejarGuardar} color="green" />
      
      {editingId && (
        <View style={{ marginTop: 10 }}>
          <Button title="Cancelar Edición" onPress={limpiarFormulario} color="gray" />
        </View>
      )}

      {/* --- AQUÍ INTEGRAMOS LA CÁMARA DEBAJO DEL BOTÓN --- */}
      <Text style={styles.tituloSecundario}>Evidencia Fotográfica</Text>
      <View style={styles.contenedorCamara}>
        <CamaraComponent />
      </View>

      <Text style={styles.tituloLista}>Lista de Pedidos</Text>
      {pedidos.map((item) => (
        <View key={item.id} style={styles.item}>
          <Text style={{fontWeight: 'bold'}}>{item.nombre} - {item.producto}</Text>
          <Text>${item.precio} x {item.cantidad}</Text>
          <Text>Observaciones: {item.observaciones ? item.observaciones : 'Sin observaciones'}</Text>
          <View style={{flexDirection: 'row', marginTop: 10, justifyContent: 'space-between'}}>
            <Button title="Editar" onPress={() => iniciarEdicion(item)} color="blue" />
            <Button title="Borrar" onPress={() => borrarPedido(item.id)} color="red" />
          </View>
        </View>
      ))}
      
      {/* Espacio extra al final para que el ScrollView funcione bien */}
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 40, backgroundColor: '#fff' },
  logo: { width: 80, height: 80, alignSelf: 'center', marginBottom: 10 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  tituloSecundario: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  tituloLista: { fontSize: 22, fontWeight: 'bold', marginTop: 30, marginBottom: 15, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 12, borderRadius: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  item: { padding: 15, backgroundColor: '#f9f9f9', borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  contenedorCamara: { 
    height: 350, // Altura suficiente para ver el visor de la cámara
    borderRadius: 15, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: '#ccc',
    backgroundColor: '#000'
  }
});