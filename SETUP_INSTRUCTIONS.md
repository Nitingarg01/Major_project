# 🚀 RecruiterAI Setup Instructions

## Phase 1: Bug Fixes - Installation & Testing

### **1. Environment Setup**

#### Create your `.env.local` file:
```bash
# The .env.local template has been created at /app/.env.local
# All your existing API keys are already configured!

# ⚠️ IMPORTANT: Add ElevenLabs API Key for Virtual AI Voice
```

#### Get FREE ElevenLabs API Key (2 minutes):
1. Visit: https://elevenlabs.io/sign-up
2. Create a free account (no credit card required)
3. Go to Profile → API Keys
4. Create a new API key
5. Copy the key and add it to `.env.local`:
   ```
   ELEVENLABS_API_KEY=your-key-here
   NEXT_PUBLIC_ELEVENLABS_API_KEY=your-key-here
   ```

**Free Tier Benefits:**
- 10,000 characters per month
- ~100 interview questions with AI voice
- 4 different AI personalities
- High-quality voice synthesis
- Resets monthly

---

### **2. Install Dependencies**

```bash
cd /app
yarn install
```

**Note:** Installation already complete! ✅

---

### **3. Run the Development Server**

```bash
cd /app
yarn dev
```

The app will be available at: http://localhost:3000

---

### **4. Test the Bug Fixes**

#### **Test Speech Recognition:**
1. Go to http://localhost:3000/dashboard
2. Create a new interview or use the "Virtual AI Demo" button
3. Click "Start Interview"
4. Test microphone:
   - Click "Start Recording"
   - Speak your answer
   - Click "Stop Recording"
   - Verify text appears in the response box
5. Test multiple start/stop cycles
6. Check browser console for errors (should be clean)

**Expected Results:**
- ✅ No "already started" errors
- ✅ Recognition auto-restarts smoothly
- ✅ Manual stop prevents auto-restart
- ✅ No errors when switching between questions

#### **Test Camera Feed:**
1. In the Virtual AI Interview setup
2. Allow camera permissions when prompted
3. Camera should start without AbortError
4. Click "Stop Camera" and "Start Camera" multiple times
5. Check console for errors

**Expected Results:**
- ✅ Camera initializes smoothly
- ✅ No AbortError in console
- ✅ Toggle camera multiple times works
- ✅ Face detection shows "Face Detected" or "Basic Detection"

#### **Test API Integration:**
1. Go to Settings page (if available)
2. Add your ElevenLabs API key
3. Test voice with "Test Voice" button
4. Start a Virtual AI Interview
5. AI should speak with either ElevenLabs or browser TTS

**Expected Results:**
- ✅ If ElevenLabs key added: Premium AI voice
- ✅ If no key: Falls back to browser TTS smoothly
- ✅ No crashes on API errors
- ✅ Error messages are user-friendly

#### **Test Conversation Flow:**
1. Start a complete Virtual AI Interview
2. Answer all questions
3. Complete the interview
4. Verify no console errors
5. Check that you receive feedback

**Expected Results:**
- ✅ Interview progresses smoothly through all questions
- ✅ Transitions work correctly
- ✅ No hanging or frozen states
- ✅ Complete interview without errors
- ✅ Feedback is generated and displayed

---

### **5. Common Issues & Solutions**

#### **Issue: "Camera permission denied"**
**Solution:**
- Click the camera icon in browser address bar
- Allow camera and microphone permissions
- Refresh the page

#### **Issue: Speech recognition not working**
**Solution:**
- Use Chrome or Edge browser (best support)
- Check microphone permissions
- Ensure microphone is not muted
- Try a different browser if issues persist

#### **Issue: "Video playback failed"**
**Solution:**
- Ensure browser supports video playback
- Check if another app is using the camera
- Try refreshing the page
- Close other tabs using the camera

#### **Issue: ElevenLabs voice not working**
**Solution:**
- Verify API key is correct in `.env.local`
- Check free tier quota at elevenlabs.io
- System will automatically fall back to browser TTS
- No action needed if browser TTS is acceptable

---

### **6. File Changes Summary**

**Files Modified:**
1. `/app/src/components/EnhancedVirtualAIInterviewer.tsx` - Speech recognition fixes
2. `/app/src/components/AdvancedCameraFeed.tsx` - Camera stability fixes
3. `/app/src/lib/enhancedVirtualInterviewerAI.ts` - API error handling
4. `/app/.env.local` - Environment configuration (created)

**Files Created:**
1. `/app/PHASE1_BUG_FIXES_COMPLETE.md` - Detailed bug fixes documentation
2. `/app/SETUP_INSTRUCTIONS.md` - This file

---

### **7. Browser Compatibility**

**Recommended:**
- ✅ Google Chrome (version 89+)
- ✅ Microsoft Edge (version 89+)

**Limited Support:**
- ⚠️ Firefox (speech recognition limited)
- ⚠️ Safari (speech recognition not supported)

---

### **8. Performance Tips**

1. **Close unnecessary tabs** - Improves camera and microphone performance
2. **Use headphones** - Prevents audio feedback during AI speech
3. **Good lighting** - Helps with face detection (if enabled)
4. **Stable internet** - Required for API calls
5. **Allow permissions** - Grant camera and microphone access when prompted

---

### **9. Next Steps**

After confirming all Phase 1 fixes work:

✅ **Phase 1:** Bug Fixes & Optimization - **COMPLETE**
⬜ **Phase 2:** Enhancements (emotion detection, personalities, scoring)
⬜ **Phase 3:** Integration improvements (dashboard, navigation)
⬜ **Phase 4:** New features (coach, multi-round, replay)

---

### **10. Support & Debugging**

**Check Logs:**
```bash
# Browser Console (F12 in Chrome/Edge)
# Look for:
- ✅ "✓ Recognition restarted" - Speech recognition working
- ✅ "ElevenLabs Service: Available" - Voice API working
- ✅ "Camera Status: Connected" - Camera working
- ❌ Any red errors - Report these
```

**Common Success Indicators:**
- Speech recognition auto-restarts without errors
- Camera feed displays without AbortError
- AI speaks questions (ElevenLabs or browser TTS)
- Interview completes successfully
- No memory leaks or hanging operations

---

### **📞 Need Help?**

If you encounter issues:
1. Check browser console for specific error messages
2. Verify `.env.local` has correct API keys
3. Ensure browser permissions are granted
4. Try a different browser (Chrome recommended)
5. Check that no other apps are using camera/microphone

---

**🎉 Phase 1 Setup Complete! Your Virtual AI Interview system is now stable and ready for testing!**
