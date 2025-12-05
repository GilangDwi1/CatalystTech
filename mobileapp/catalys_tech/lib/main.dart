import 'package:flutter/material.dart';
import '/login_page.dart';
import '/realtime_absensi_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  static const fastApiUrl = "https://7b24c23bbe88.ngrok-free.app/recognize";
  static const nestApiUrl = "https://b78e7e9c2ec6.ngrok-free.app";

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
      token = jwtToken;   // <-- ini yang membuat pindah halaman
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
          ? LoginPage(
        apiUrl: MyApp.nestApiUrl,
        onLoginSuccess: _onLoginSuccess,
      )
          : RealtimeAbsensiPage(
        fastApiUrl: MyApp.fastApiUrl,
        nestApiUrl: MyApp.nestApiUrl,
        jwtToken: token!,
        onLogout: _logout,
      ),
    );
  }
}
