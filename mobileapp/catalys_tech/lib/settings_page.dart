import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final TextEditingController apiController = TextEditingController();

  @override
  void initState() {
    super.initState();
    loadApiUrl();
  }

  Future<void> loadApiUrl() async {
    final prefs = await SharedPreferences.getInstance();
    apiController.text = prefs.getString("nest_api_url") ?? "";
    setState(() {});
  }

  Future<void> saveApiUrl() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString("nest_api_url", apiController.text.trim());
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("API URL disimpan")),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Pengaturan API")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const Text("NestJS API URL (Ngrok)"),
            TextField(
              controller: apiController,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                hintText: "https://xxxx.ngrok-free.app",
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: saveApiUrl,
              child: const Text("Simpan"),
            )
          ],
        ),
      ),
    );
  }
}
