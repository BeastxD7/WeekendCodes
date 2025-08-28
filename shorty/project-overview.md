# Viral Shorts Maker with Smart Splitting

## Project Overview
This project is a Viral Shorts Maker tool designed to process long YouTube videos into engaging short clips optimized for platforms like YouTube Shorts and Instagram Reels. The tool uses advanced AI techniques to "smart split" videos based on natural conversation breaks and meaningful transcription analysis, avoiding awkward mid-sentence cuts. Users can preview, edit, and customize clips with transcription-based text overlays and background music before exporting them.

---

## Key Features

- **Input**: Users provide a YouTube URL for processing.
- **Video Splitting Options**:
  - *Smart Splitting*: Uses speech transcript and an LLM (via OpenRouter) to segment the video at natural conversation boundaries or meaningful topic shifts.
  - *Regular Sequential Splitting*: Split videos into fixed-length clips (user-defined duration).
- **Text Overlay**: Automatically generated live transcription captions are overlaid on clips for enhanced engagement and clarity.
- **Background Music**: Option for global background music added to the entire set of shorts per job.
- **Multi-language Transcription**: Supports multiple languages for transcription and captions.
- **User Interaction**: Users can preview each clip, listen to audio, and edit splits by merging, deleting, or adjusting clip boundaries before exporting.
- **Multi-user Support**: System supports multiple users with authentication planned for email/password and social login.
- **Vertical Format Output**: Clips formatted for vertical, mobile-first viewing.
  
---

## Technical Stack

| Layer       | Technology                            | Role                                           |
|-------------|------------------------------------|------------------------------------------------|
| Frontend    | React                              | User interface, video preview/editing          |
| Backend     | FastAPI                            | Video processing, transcription, splitting logic, API endpoints |
| Database    | MongoDB                           | User data, job and clip metadata storage       |
| AI & ML     | OpenRouter (LLM Interface)         | Transcript chunking and smart split logic       |
| Video Tools | MoviePy, OpenCV (Python libraries) | Video cutting, text overlays, audio mixing     |
| Speech-to-Text | Whisper / Google STT / Sonix       | Transcriptions in multiple languages            |

---

## Workflow

1. **Video Input**  
   User submits a YouTube video URL.

2. **Video Download & Transcription**  
   Backend downloads video; speech is transcribed using multi-language speech-to-text.

3. **Smart Splitting via LLM**  
   Transcription sent to OpenRouter-powered LLM to intelligently segment video into meaningful clips aligned with conversation boundaries.

4. **Clip Generation**  
   Video is cut into vertical short clips; text captions are overlaid with transcription snippets.

5. **Background Music**  
   Global background music is mixed into generated clips (optional).

6. **User Review & Editing**  
   Users preview clips in the frontend, listen and view text overlays, and edit clip boundaries or merge/delete segments.

7. **Export & Share**  
   Final clips ready for export and sharing on social media platforms.

---

## Future Considerations

- Add admin panel and usage tracking.
- Implement file size, resolution, and clips count limits.
- Extend UI and backend support for branded watermarks or call-to-action overlays.
- Expand multi-language UI localization.
- Integrate additional AI models via OpenRouter for enhanced video understanding.

---

## Contact / Next Steps

- Proceed with high-fidelity UI wireframes.
- Develop prototype backend capable of video download, speech transcription, and basic sequential splitting.
- Integrate OpenRouter API for smart splitting logic.
- Build React UI components for clip preview and editing.
- Plan multi-user authentication and MongoDB schema.

---

*This document summarizes the full scope and technical considerations of the Viral Shorts Maker tool designed for AI-powered automatic video clipping and social media shorts creation.*

