import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'package:camera/camera.dart';
import 'package:catalys_tech/main.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'login_page.dart'; // ⬅ pastikan import ini benar
// import file lain jika perlu

class RealtimeAbsensiPage extends StatefulWidget {
  final String fastApiUrl;
  final String nestApiUrl;
  final String jwtToken;
  final VoidCallback onLogout;

  const RealtimeAbsensiPage({
    super.key,
    required this.fastApiUrl,
    required this.nestApiUrl,
    required this.jwtToken,
    required this.onLogout,
  });

  @override
  State<RealtimeAbsensiPage> createState() => _RealtimeAbsensiPageState();
}

class _RealtimeAbsensiPageState extends State<RealtimeAbsensiPage> {
  // CONFIG
  double similarityThreshold = 0.6;
  Duration captureInterval = const Duration(milliseconds: 700);
  Duration cooldownDuration = const Duration(seconds: 3);

  // Camera state
  CameraController? _cameraController;
  Timer? _frameTimer;
  bool isProcessing = false;
  bool isCooldown = false;
  String? lastDetectedId;
  int currentCameraIndex = 0;

  String statusText = "Idle";
  Color statusColor = Colors.white;

  @override
  void initState() {
    super.initState();
    _initCamera();
  }

  @override
  void dispose() {
    _frameTimer?.cancel();
    _cameraController?.dispose();
    super.dispose();
  }

  Future<void> _initCamera() async {
    try {
      final cameras = await availableCameras();

      if (cameras.isEmpty) {
        _setStatus("Tidak ada kamera terdeteksi", Colors.red);
        return;
      }

      final camera = cameras[currentCameraIndex];

      _cameraController = CameraController(
        camera,
        ResolutionPreset.medium,
        enableAudio: false,
      );

      await _cameraController!.initialize();
      if (mounted) setState(() {});
    } catch (e) {
      _setStatus("Gagal buka kamera: $e", Colors.red);
    }
  }

  Future<void> _switchCamera() async {
    final cameras = await availableCameras();

    if (cameras.length < 2) {
      _setStatus("Device tidak punya 2 kamera", Colors.orange);
      return;
    }

    _frameTimer?.cancel();
    isProcessing = false;

    currentCameraIndex = currentCameraIndex == 0 ? 1 : 0;

    _setStatus("Mengganti kamera...", Colors.yellow);

    await _cameraController?.dispose();
    await _initCamera();

    _setStatus("Kamera aktif", Colors.green);
  }

  void _setStatus(String msg, Color color) {
    setState(() {
      statusText = msg;
      statusColor = color;
    });
  }

  void _start() {
    if (_frameTimer != null && _frameTimer!.isActive) return;

    _frameTimer = Timer.periodic(captureInterval, (_) => _capture());
    _setStatus("Mendeteksi…", Colors.yellow);
  }

  void _stop() {
    _frameTimer?.cancel();
    _frameTimer = null;
    _setStatus("Idle", Colors.white);
  }

  Future<void> _capture() async {
    if (isProcessing || isCooldown) return;

    try {
      isProcessing = true;

      final file = await _cameraController!.takePicture();
      final bytes = await file.readAsBytes();

      final face = await _sendToFastAPI(bytes);
      isProcessing = false;

      if (face == null) {
        _setStatus("Wajah tidak dikenali", Colors.orange);
        return;
      }

      final name = face["name"];
      final sim = (face["similarity"] as num).toDouble();

      if (sim < similarityThreshold) {
        _setStatus("Similarity rendah: $sim", Colors.orange);
        return;
      }

      if (isCooldown && lastDetectedId == name) {
        return;
      }

      final nest = await _sendToNestJS(name);

      if (nest == null) {
        _setStatus("NestJS gagal respon", Colors.red);
      } else {
        final nest = await _sendToNestJS(name);

// ========== CEK JIKA ERROR ==========
        if (nest == null || nest["success"] == false || nest["data"] == null) {
          _setStatus(
            nest?["message"] ?? "Gagal absen (unknown)",
            Colors.red,
          );
          return;
        }

// ========== AMAN MENGAKSES DATA ==========
        final data = nest["data"];
        final karyawan = data["karyawan"];

        final nip = karyawan["NIP"];
        final nama = karyawan["nama"];
        final waktu = data["waktu"];

        _setStatus("Berhasil Absen ! $nama ($nip) - $waktu", Colors.green);
      }

      lastDetectedId = name;
      isCooldown = true;

      Future.delayed(cooldownDuration, () {
        isCooldown = false;
        lastDetectedId = null;
        _setStatus("Mendeteksi…", Colors.yellow);
      });

    } catch (e) {
      isProcessing = false;
      _setStatus("Error: $e", Colors.red);
    }
  }

  Future<Map<String, dynamic>?> _sendToFastAPI(Uint8List bytes) async {
    try {
      final req = http.MultipartRequest("POST", Uri.parse(widget.fastApiUrl));
      req.files.add(
        http.MultipartFile.fromBytes("file", bytes, filename: "frame.jpg"),
      );

      final stream = await req.send();
      final resp = await http.Response.fromStream(stream);

      if (resp.statusCode == 200) return jsonDecode(resp.body);
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<Map<String, dynamic>?> _sendToNestJS(String karyawanId) async {
    try {
      final resp = await http.post(
        Uri.parse("${widget.nestApiUrl}/absen"),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer ${widget.jwtToken}",
        },
        body: jsonEncode({"id_karyawan": int.parse(karyawanId)}),
      );

      final body = jsonDecode(resp.body);

      // Respons error dari NestJS (status 400 – 500)
      if (resp.statusCode >= 400) {
        return {
          "success": false,
          "message": body["message"] ?? "Terjadi kesalahan",
          "data": null
        };
      }

      // Respons success
      return {
        "success": true,
        "message": body["message"],
        "data": body["data"]
      };

    } catch (e) {
      print("NestJS error: $e");
      return {
        "success": false,
        "message": "Tidak dapat terhubung ke server",
        "data": null
      };
    }
  }


  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove("jwt_token");

    // HENTIKAN CAMERA SUPAYA RELOAD BISA
    _frameTimer?.cancel();
    await _cameraController?.dispose();

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(
        builder: (_) => LoginPage(
          key: UniqueKey(),        // penting
          apiUrl: MyApp.nestApiUrl,
          onLoginSuccess: (jwt) {},
        ),
      ),
          (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final ready = _cameraController?.value.isInitialized ?? false;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Realtime Absensi"),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: widget.onLogout,
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: Stack(
              children: [
                // CAMERA
                ready
                    ? CameraPreview(_cameraController!)
                    : const Center(child: Text("Inisialisasi kamera…")),

                // STATUS TEXT DI POJOK KIRI ATAS
                Positioned(
                  left: 10,
                  top: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      statusText,
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // FOOTER BUTTONS
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.black87,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    ElevatedButton(
                      onPressed: _switchCamera,
                      child: const Text("Switch Camera"),
                    ),
                    const SizedBox(width: 10),

                    ElevatedButton(
                        onPressed: _start, child: const Text("Start")),
                    const SizedBox(width: 10),

                    ElevatedButton(
                        onPressed: _stop, child: const Text("Stop")),
                  ],
                ),

                // Logout button
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                  ),
                  onPressed: _logout,
                  child: const Text("Logout"),
                ),
              ],
            ),
          ),
        ],
      ),

    );
  }
}
