import mongoose from "mongoose";

const AppSchema = new mongoose.Schema({
    appID: { 
        type: String, 
        unique: true, 
        required: true 
    },
    appName: { 
        type: String, 
        required: true
    },
    developerID: { 
        type: mongoose.Schema.Types.ObjectId, ref: "Dev", 
        required: true 
    },
    clientSecret: { 
        type: String, 
        required: true 
    },
    redirectAfterLogin: { 
        type: String, 
        default: "/profile" 
    },
    customizations: {
      theme: {
        bgColor: { type: String, default: "#ffffff" },
        logoUrl: { type: String, default: "" },
      },
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

AppSchema.index({ appName: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

const App = mongoose.models.App || mongoose.model("App", AppSchema);

export default App;
