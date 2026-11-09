import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'login_page.dart'; // Contoh jika LoginPage ada di folder pages
import 'realtime_absensi_page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  static const fastApiUrl = "https://ef560b8da4ed.ngrok-free.app/recognize";
  static const nestApiUrl = "https://a4690ecd5382.ngrok-free.app";

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  String? token;

  @override
  void initState() {
    super.initState();
    _loadToken();
  }

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      token = prefs.getString("token");
    });
  }

  Future<void> _onLoginSuccess(String jwtToken) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString("token", jwtToken);

    setState(() {
      token = jwtToken; // <-- ini yang membuat pindah halaman
    });
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove("token");

    setState(() {
      token = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Absensi",
      debugShowCheckedModeBanner: false,
      home: token == null
          ? LoginPage(apiUrl: MyApp.nestApiUrl, onLoginSuccess: _onLoginSuccess)
          : RealtimeAbsensiPage(
              fastApiUrl: MyApp.fastApiUrl,
              nestApiUrl: MyApp.nestApiUrl,
              jwtToken: token!,
              onLogout: _logout,
            ),
    );
  }
}
