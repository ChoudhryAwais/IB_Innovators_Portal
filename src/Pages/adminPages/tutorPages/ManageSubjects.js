import React, { useState, useEffect, useContext } from "react";
import { collection, updateDoc, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Divider,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import Slide from "@mui/material/Slide";
import { toast } from "react-hot-toast";
import { TopHeadingProvider, useTopHeading } from "../../../Components/Layout";
import CustomModal from "../../../Components/CustomModal/CustomModal";
import { MyContext } from "../../../Context/MyContext";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { InputAdornment } from "@mui/material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function ManageSubjects() {
  const { setFirstMessage, setSecondMessage } = useTopHeading();
  const { subjectsWithCategory } = useContext(MyContext);

  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    setFirstMessage("Subjects");
    setSecondMessage("Show all Subjects");
  }, [setFirstMessage, setSecondMessage]);

  const scienceSubjects =
    subjectsWithCategory?.filter((s) => s.category === "Science") || [];
  const humanitiesSubjects =
    subjectsWithCategory?.filter(
      (s) => s.category === "Humanities & Social Sciences"
    ) || [];
  const languageSubjects =
    subjectsWithCategory?.filter((s) => s.category === "Languages") || [];

  const handleAddSubject = async () => {
    if (!newSubject.trim()) {
      toast.error("Please enter a subject name");
      return;
    }

    try {
      const userListRef = collection(db, "subjectsAvailable");
      const querySnapshot = await getDocs(userListRef);

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const existingSubjects = data.subjects || [];
        const existingWithCategories = data.subjectsWithCategory || [];

        const updatedSubjects = [...existingSubjects, newSubject];
        const updatedWithCategories = [
          ...existingWithCategories,
          { name: newSubject, category: newCategory },
        ];

        await updateDoc(docSnap.ref, {
          subjects: updatedSubjects,
          subjectsWithCategory: updatedWithCategories,
        });
      }

      toast.success(`Subject "${newSubject}" added to ${newCategory}`);
      setNewSubject("");
      setOpenDialog(false);
    } catch (error) {
      console.error(error);
      toast.error("Error adding subject");
    }
  };

  const renderSubjectsWithHL_SL = (subjectsArray) => {
    // Separate HL and SL subjects
    const hlSubjects = subjectsArray.filter((s) => s.name.includes("(HL)"));
    const slSubjects = subjectsArray.filter((s) => s.name.includes("(SL)"));

    // Subjects without HL/SL
    const otherSubjects = subjectsArray.filter(
      (s) => !s.name.includes("(HL)") && !s.name.includes("(SL)")
    );

    // Map SL for easy matching
    const slMap = new Map();
    slSubjects.forEach((sl) => {
      const baseName = sl.name.replace("(SL)", "").trim();
      slMap.set(baseName, sl.name);
    });

    const pairedSubjects = [];

    // Pair HL with SL
    hlSubjects.forEach((hl) => {
      const baseName = hl.name.replace("(HL)", "").trim();
      const slMatch = slMap.get(baseName) || "";
      if (slMatch) slMap.delete(baseName);
      pairedSubjects.push({ hl: hl.name, sl: slMatch });
    });

    // Add remaining unmatched SL subjects
    slMap.forEach((slName) => {
      pairedSubjects.push({ hl: "", sl: slName });
    });

    // Pair "other" subjects two by two
    for (let i = 0; i < otherSubjects.length; i += 2) {
      const first = otherSubjects[i]?.name || "";
      const second = otherSubjects[i + 1]?.name || "";
      pairedSubjects.push({ hl: first, sl: second });
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {pairedSubjects.map((pair, idx) => (
          <React.Fragment key={idx}>
            <div className="p-1 font-light text-[12px] sm:text-[14px] rounded-md break-words">{pair.hl}</div>
            <div className="p-1 font-light text-[12px] sm:text-[14px] rounded-md break-words">{pair.sl}</div>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderSubjectsSingleCol = (subjectsArray) => {
    // Create a map where key = language (first word of subject), value = array of subjects
    const languageMap = {};

    subjectsArray.forEach((subject) => {
      const firstWord = subject.name.split(" ")[0]; // Assuming the first word is the language
      if (!languageMap[firstWord]) languageMap[firstWord] = [];
      languageMap[firstWord].push(subject.name);
    });

    // Convert map to JSX
    return (
      <div className="flex flex-col gap-3 sm:gap-4 ">
        {Object.keys(languageMap).map((language) => (
          <div key={language} className="flex flex-col gap-1 sm:gap-2">
            <h4 className="text-[12px] sm:text-[14px] font-semibold">{language}</h4>
            {languageMap[language].map((subj, idx) => (
              <div
                key={idx}
                className="font-light text-[12px] sm:text-[14px] rounded-md p-1 "
              >
                {subj}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex-1 mt-0 mb-2 p-3 sm:p-4 md:p-6 rounded-lg border border-[#A2A1A833] bg-white/50">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 md:gap-0 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-2 sm:mb-0">
            Subjects ({subjectsWithCategory?.length || 0})
          </h2>
          <Button
            variant="contained"
            onClick={() => setOpenDialog(true)}
            sx={{
              backgroundColor: "#4071B6",
              width: { xs: "100%", sm: "100%", md: "250px" },
              height: { xs: "40px", sm: "44px", md: "50px" },
              "&:hover": { backgroundColor: "#427ac9ff" },
              color: "white",
              px: 3,
              py: 1.5,
              borderRadius: "0.5rem",
              fontWeight: 500,
              textTransform: "none",
              fontSize: { xs: "14px", sm: "14px", md: "16px" },
            }}
          >
            + Add a new subject
          </Button>
        </div>

        {/* Categories responsive layout */}
        <div className="flex flex-col sm:flex-col md:grid md:grid-cols-5 gap-4">
          {/* Left column: Science + Humanities */}
          <div className="flex flex-col gap-4 sm:gap-4 md:gap-6 md:col-span-3">
            <div className="border border-[#A2A1A833] rounded-[10px] p-3 sm:p-3 md:p-4">
              <h3 className="text-[16px] sm:text-[18px] md:text-xl font-semibold mb-2">
                Science ({scienceSubjects.length})
              </h3>
              {renderSubjectsWithHL_SL(scienceSubjects)}
            </div>

            <div className="border border-[#A2A1A833] rounded-[10px] p-3 sm:p-3 md:p-4">
              <h3 className="text-[16px] sm:text-[18px] md:text-xl font-semibold mb-2">
                Humanities & Social Sciences ({humanitiesSubjects.length})
              </h3>
              {renderSubjectsWithHL_SL(humanitiesSubjects)}
            </div>
          </div>

          {/* Right column: Languages */}
          <div className="border border-[#A2A1A833] rounded-[10px] p-3 sm:p-3 md:p-4 md:col-span-2">
            <h3 className="text-[16px] sm:text-[18px] md:text-xl font-semibold mb-3">
              Languages ({languageSubjects.length})
            </h3>
            {renderSubjectsSingleCol(languageSubjects)}
          </div>
        </div>

        {/* Add Subject Modal */}
        <CustomModal
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          PaperProps={{
            sx: {
              height: "auto",
              overflow: "hidden",
              borderRadius: "20px",
              width: { xs: "90%", sm: "350px", md: "383px" },
              maxWidth: "383px",
              margin: { xs: "20px", sm: "auto" }
            },
          }}
        >
          <h2 className="text-[16px] sm:text-lg md:text-xl font-semibold text-start text-[#16151C] mb-3 sm:mb-4 md:mb-7">
            Add New Subject
          </h2>
          <Divider sx={{ borderColor: "#E5E7EB", mb: 2, sm: 2, md: 3 }} />

          <FormControl size="small" fullWidth sx={{ mb: 3, sm: 3, md: 4 }}>
            <Select
              value={newCategory || ""}
              required
              onChange={(e) => setNewCategory(e.target.value)}
              displayEmpty
              className="bg-white"
              sx={{
                height: { xs: 48, sm: 52, md: 56 },
                borderRadius: "10px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#A2A1A833",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#16151C",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#16151C",
                },
              }}
              IconComponent={KeyboardArrowDownIcon}
            >
              <MenuItem value="" disabled>
                <span className="text-[#A2A1A8CC]">Select Category</span>
              </MenuItem>
              <MenuItem value="Science">Science</MenuItem>
              <MenuItem value="Humanities & Social Sciences">
                Humanities & Social Sciences
              </MenuItem>
              <MenuItem value="Languages">Languages</MenuItem>
            </Select>
          </FormControl>

          <TextField
            type="text"
            placeholder="Enter Subject Name"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            required
            size="small"
            className="h-14"
            InputProps={{
              sx: {
                height: { xs: 48, sm: 52, md: 56 },
                borderRadius: "10px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#A2A1A833",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#16151C",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#16151C",
                },
                "& input::placeholder": {
                  color: "#A2A1A8CC",
                  opacity: 1,
                },
              },
            }}
            sx={{ mb: 2, sm: 2, md: 3 }}
          />

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
            <Button
              onClick={() => {
                setNewSubject("");
                setOpenDialog(false);
              }}
              variant="outlined"
              sx={{
                width: { xs: "100%", sm: "48%", md: 166 },
                height: { xs: 40, sm: 44, md: 50 },
                borderRadius: "10px",
                borderColor: "#A2A1A833",
                fontSize: { xs: "14px", sm: "14px", md: "16px" },
                fontWeight: 300,
                color: "#16151C",
                textTransform: "none",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddSubject}
              sx={{
                width: { xs: "100%", sm: "48%", md: 166 },
                height: { xs: 40, sm: 44, md: 50 },
                borderRadius: "10px",
                backgroundColor: "#4071B6",
                fontSize: { xs: "14px", sm: "16px", md: "16px" },
                fontWeight: 300,
                color: "#FFFFFF",
                textTransform: "none",
                "&:hover": { backgroundColor: "#305a91" },
              }}
            >
              Add
            </Button>
          </div>
        </CustomModal>
      </div>
    </div>
  );
}