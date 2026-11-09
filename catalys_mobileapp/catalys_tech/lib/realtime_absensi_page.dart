import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_tts/flutter_tts.dart'; // Tambahkan ini

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
  Duration cooldownDuration = const Duration(seconds: 4);

  // Plugins
  CameraController? _cameraController;
  Timer? _frameTimer;
  final FlutterTts _flutterTts = FlutterTts();

  // State
  bool isProcessing = false;
  bool isCooldown = false;
  bool isScanning = false;
  String? lastDetectedId;
  int currentCameraIndex = 0;
  bool isFaceCheckCooldown = false;
  String? lastFaceName;

  String statusText = "Siap Absen";
  Color statusColor = Colors.cyanAccent;

  @override
  void initState() {
    super.initState();
    _initCamera();
    _initTts();
  }

  // Inisialisasi Suara
  Future<void> _initTts() async {
    await _flutterTts.setLanguage("id-ID");
    await _flutterTts.setPitch(1.0);
    await _flutterTts.setSpeechRate(0.5);
  }

  Future<void> _speak(String text) async {
    await _flutterTts.speak(text);
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
      if (cameras.isEmpty) return;

      final camera = cameras[currentCameraIndex];
      _cameraController = CameraController(
        camera,
        ResolutionPreset.high, // Resolusi lebih tajam
        enableAudio: false,
      );

      await _cameraController!.initialize();
      if (mounted) setState(() {});
    } catch (e) {
      _setStatus("Gagal buka kamera", Colors.redAccent);
    }
  }

  void _setStatus(String msg, Color color) {
    if (!mounted) return;
    setState(() {
      statusText = msg;
      statusColor = color;
    });
  }

  void _start() {
    setState(() => isScanning = true);
    _frameTimer = Timer.periodic(captureInterval, (_) => _capture());
    _setStatus("Mencari Wajah...", Colors.cyanAccent);
  }

  void _stop() {
    setState(() => isScanning = false);
    _frameTimer?.cancel();
    _frameTimer = null;
    _setStatus("Sistem Berhenti", Colors.white70);
  }

  Future<void> _switchCamera() async {
    _stop();
    currentCameraIndex = currentCameraIndex == 0 ? 1 : 0;
    await _cameraController?.dispose();
    await _initCamera();
  }

  Future<void> _capture() async {
    if (isProcessing || isCooldown || isFaceCheckCooldown || !isScanning)
      return;

    try {
      isProcessing = true;
      final file = await _cameraController!.takePicture();
      final bytes = await file.readAsBytes();

      final face = await _sendToFastAPI(bytes);
      isProcessing = false;

      if (face == null || face["name"].toString().toLowerCase() == "unknown") {
        _setStatus("Wajah Tidak Dikenali", Colors.orangeAccent);
        return;
      }

      final name = face["name"];
      final sim = (face["similarity"] as num).toDouble();

      if (sim < similarityThreshold) {
        _setStatus("Dekatkan Wajah Anda", Colors.orangeAccent);
        return;
      }

      // Mencegah hit API berulang dalam waktu singkat
      isFaceCheckCooldown = true;
      Future.delayed(
        const Duration(seconds: 2),
        () => isFaceCheckCooldown = false,
      );

      final nest = await _sendToNestJS(name);

      if (nest != null && nest["success"] == true) {
        final data = nest["data"];
        final namaKaryawan = data["karyawan"]["nama"];

        _setStatus(
          "Berhasil! Silahkan Masuk $namaKaryawan",
          Colors.greenAccent,
        );

        // FITUR SUARA
        _speak("Silahkan masuk, $namaKaryawan");

        isCooldown = true;
        Future.delayed(cooldownDuration, () {
          isCooldown = false;
          _setStatus("Mencari Wajah...", Colors.cyanAccent);
        });
      } else {
        _setStatus(nest?["message"] ?? "Gagal Absen", Colors.redAccent);
      }
    } catch (e) {
      isProcessing = false;
    }
  }

  // --- API HELPER (Logic tetap sama) ---
  Future<Map<String, dynamic>?> _sendToFastAPI(Uint8List bytes) async {
    try {
      final req = http.MultipartRequest("POST", Uri.parse(widget.fastApiUrl));
      req.files.add(
        http.MultipartFile.fromBytes("file", bytes, filename: "frame.jpg"),
      );
      final resp = await http.Response.fromStream(await req.send());
      if (resp.statusCode == 200) return jsonDecode(resp.body);
    } catch (_) {}
    return null;
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
      if (resp.statusCode >= 400)
        return {"success": false, "message": body["message"]};
      return {"success": true, "data": body["data"]};
    } catch (_) {
      return {"success": false, "message": "Server Error"};
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. KAMERA FULLSCREEN
          _cameraController != null && _cameraController!.value.isInitialized
              ? Transform.scale(
                  scale: 1.0,
                  child: Center(
                    child: AspectRatio(
                      aspectRatio: _cameraController!.value.aspectRatio,
                      child: CameraPreview(_cameraController!),
                    ),
                  ),
                )
              : const Center(
                  child: CircularProgressIndicator(color: Colors.cyanAccent),
                ),

          // 2. OVERLAY SCANNER FRAME
          if (isScanning)
            Center(
              child: Container(
                width: size.width * 0.75,
                height: size.width * 1.0,
                decoration: BoxDecoration(
                  border: Border.all(
                    color: statusColor.withOpacity(0.5),
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(30),
                ),
              ),
            ),

          // 3. STATUS BAR MODERN (TOP)
          Positioned(
            top: 60,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
              decoration: BoxDecoration(
                color: Colors.black45,
                borderRadius: BorderRadius.circular(25),
                border: Border.all(color: statusColor.withOpacity(0.5)),
                boxShadow: [
                  BoxShadow(
                    color: statusColor.withOpacity(0.2),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: statusColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 15),
                  Expanded(
                    child: Text(
                      statusText,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 4. CONTROL PANEL (BOTTOM)
          Positioned(
            bottom: 40,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                borderRadius: BorderRadius.circular(30),
                border: Border.all(color: Colors.white24),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _actionIcon(
                    Icons.flip_camera_android,
                    "Switch",
                    _switchCamera,
                  ),
                  _mainButton(),
                  _actionIcon(Icons.logout, "Logout", widget.onLogout),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _mainButton() {
    return GestureDetector(
      onTap: isScanning ? _stop : _start,
      child: Container(
        height: 70,
        width: 70,
        decoration: BoxDecoration(
          color: isScanning ? Colors.redAccent : Colors.cyanAccent,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: isScanning ? Colors.redAccent : Colors.cyanAccent,
              blurRadius: 20,
              spreadRadius: 2,
            ),
          ],
        ),
        child: Icon(
          isScanning ? Icons.stop_rounded : Icons.play_arrow_rounded,
          color: Colors.white,
          size: 40,
        ),
      ),
    );
  }

  Widget _actionIcon(IconData icon, String label, VoidCallback onTap) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          onPressed: onTap,
          icon: Icon(icon, color: Colors.white, size: 28),
        ),
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 10),
        ),
      ],
    );
  }
}
