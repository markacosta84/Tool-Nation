// Tool Nation PDF Studio - Enhanced JavaScript

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    updateCounters();
    setupDragAndDrop();
    setupEventListeners();
    
    // Store initial scroll position
    storeScrollPosition();
});

// Store current scroll position
let scrollPosition = { top: 0, left: 0 };

function storeScrollPosition() {
    const textEditor = document.getElementById('textEditor');
    scrollPosition = {
        top: textEditor.scrollTop,
        left: textEditor.scrollLeft
    };
}

// Restore scroll position
function restoreScrollPosition() {
    const textEditor = document.getElementById('textEditor');
    textEditor.scrollTop = scrollPosition.top;
    textEditor.scrollLeft = scrollPosition.left;
}

// Set up drag and drop functionality
function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    const textEditor = document.getElementById('textEditor');
    const fileInput = document.getElementById('fileInput');
    const fileSelectBtn = document.getElementById('fileSelectBtn');
    
    // Make the select file button trigger the file input
    fileSelectBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Handle file selection
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    // Add event listeners for drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        textEditor.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop zone when file is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
        textEditor.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
        textEditor.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    textEditor.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    this.classList.add('dragover');
}

function unhighlight(e) {
    this.classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            readTextFile(file);
        } else {
            alert('Please upload a .txt file only.');
        }
    }
}

function readTextFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        // Store current scroll position before updating content
        storeScrollPosition();
        
        // Update editor content
        document.getElementById('textEditor').innerHTML = e.target.result;
        
        // Update counters
        updateCounters();
        
        // Try to auto-detect title
        autoDetectTitle();
        
        // Restore scroll position after a brief delay
        setTimeout(restoreScrollPosition, 10);
    };
    reader.readAsText(file);
}

// Set up all event listeners
function setupEventListeners() {
    const textEditor = document.getElementById('textEditor');
    const downloadBtn = document.getElementById('downloadPdf');
    const addLinkBtn = document.getElementById('addLinkBtn');
    const clearBtn = document.getElementById('clearBtn');
    const autoTitleBtn = document.getElementById('autoTitleBtn');
    
    // Update counters when typing
    textEditor.addEventListener('input', function() {
        updateCounters();
        
        // Store scroll position during typing
        storeScrollPosition();
    });
    
    // Handle paste event
    textEditor.addEventListener('paste', function(e) {
        // Store scroll position before paste
        storeScrollPosition();
        
        // Allow default paste behavior then update counters
        setTimeout(function() {
            updateCounters();
            autoDetectTitle();
            restoreScrollPosition();
        }, 10);
    });
    
    // Download PDF button
    downloadBtn.addEventListener('click', generatePDF);
    
    // Add link button
    addLinkBtn.addEventListener('click', addLinkToText);
    
    // Clear button - REMOVED CONFIRMATION POPUP
    clearBtn.addEventListener('click', clearEditor);
    
    // Auto-detect title button
    autoTitleBtn.addEventListener('click', autoDetectTitle);
    
    // Format buttons
    const formatBtns = document.querySelectorAll('.format-btn');
    formatBtns.forEach(btn => {
        if (btn.dataset.command) {
            btn.addEventListener('click', function() {
                formatText(this.dataset.command);
            });
        } else if (btn.dataset.heading) {
            btn.addEventListener('click', function() {
                setHeading(parseInt(this.dataset.heading));
            });
        } else if (btn.dataset.align) {
            btn.addEventListener('click', function() {
                justifyText(this.dataset.align);
            });
        }
    });
}

// Update word and character counters
function updateCounters() {
    const text = document.getElementById('textEditor').innerText;
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const charCount = text.length;
    
    document.getElementById('wordCount').textContent = wordCount;
    document.getElementById('charCount').textContent = charCount;
}

// Text formatting functions
function formatText(command) {
    document.execCommand(command, false, null);
    document.getElementById('textEditor').focus();
}

function justifyText(alignment) {
    document.execCommand('justify' + alignment, false, null);
    document.getElementById('textEditor').focus();
}

function setHeading(level) {
    document.execCommand('formatBlock', false, '<h' + level + '>');
    document.getElementById('textEditor').focus();
}

// Add link to selected text
function addLinkToText() {
    const selectedText = window.getSelection().toString();
    if (!selectedText) {
        alert('Please select some text to add a link.');
        return;
    }
    
    const url = prompt('Enter URL for the link:', 'https://');
    if (url !== null && url !== '') {
        document.execCommand('createLink', false, url);
    }
    document.getElementById('textEditor').focus();
}

// Clear editor content - REMOVED CONFIRMATION POPUP
function clearEditor() {
    // Store scroll position before clearing
    storeScrollPosition();
    
    document.getElementById('textEditor').innerHTML = '';
    document.getElementById('pdfName').value = 'ToolNation Document';
    updateCounters();
    
    // Restore scroll position
    restoreScrollPosition();
}

// Auto-detect title from content - FIXED to get full title without unnecessary truncation
function autoDetectTitle() {
    const textEditor = document.getElementById('textEditor');
    const pdfNameInput = document.getElementById('pdfName');
    
    // Try to find the first heading (h1, h2, h3)
    const headings = textEditor.querySelectorAll('h1, h2, h3');
    if (headings.length > 0) {
        const firstHeading = headings[0].textContent.trim();
        if (firstHeading) {
            // Clean up the title - keep the full title, just remove problematic characters
            let cleanTitle = firstHeading
                .replace(/[^\w\s-.,!?]/g, '') // Remove only problematic special characters
                .replace(/\s+/g, ' ')         // Replace multiple spaces with single space
                .trim();                      // Remove leading/trailing spaces
            
            if (cleanTitle && cleanTitle.length > 0) {
                pdfNameInput.value = cleanTitle;
                console.log('Detected title from heading:', cleanTitle);
                return;
            }
        }
    }
    
    // If no heading found, try to use the first paragraph
    const firstParagraph = textEditor.querySelector('p');
    if (firstParagraph) {
        const paragraphText = firstParagraph.textContent.trim();
        if (paragraphText) {
            // Take first sentence or reasonable chunk from paragraph
            const firstSentence = paragraphText.split(/[.!?]/)[0].trim();
            if (firstSentence && firstSentence.length > 10) {
                let cleanTitle = firstSentence
                    .replace(/[^\w\s-.,]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
                
                if (cleanTitle) {
                    pdfNameInput.value = cleanTitle;
                    console.log('Detected title from first paragraph:', cleanTitle);
                    return;
                }
            }
            
            // If first sentence is too short, take a larger chunk but limit to reasonable length
            const reasonableChunk = paragraphText.substring(0, 60).trim();
            if (reasonableChunk && reasonableChunk.length > 15) {
                let cleanTitle = reasonableChunk
                    .replace(/[^\w\s-.,]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
                
                if (cleanTitle) {
                    pdfNameInput.value = cleanTitle;
                    console.log('Detected title from paragraph chunk:', cleanTitle);
                    return;
                }
            }
        }
    }
    
    // If no suitable text found in structured elements, try the first line of the entire content
    const allText = textEditor.innerText.trim();
    if (allText) {
        const firstLine = allText.split('\n')[0].trim();
        if (firstLine && firstLine.length > 10) {
            let cleanTitle = firstLine
                .replace(/[^\w\s-.,]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            
            if (cleanTitle) {
                pdfNameInput.value = cleanTitle;
                console.log('Detected title from first line:', cleanTitle);
                return;
            }
        }
        
        // If first line is too short, try to find a meaningful title in the first few lines
        const lines = allText.split('\n').filter(line => line.trim().length > 10);
        if (lines.length > 0) {
            let cleanTitle = lines[0]
                .replace(/[^\w\s-.,]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            
            if (cleanTitle) {
                pdfNameInput.value = cleanTitle;
                console.log('Detected title from meaningful line:', cleanTitle);
                return;
            }
        }
    }
    
    // Fallback to default name if no suitable title found
    pdfNameInput.value = 'ToolNation Document';
    console.log('No suitable title found, using default');
}

// Generate and download PDF - PROPERLY FIXED to capture all content
function generatePDF() {
    const pdfName = document.getElementById('pdfName').value || 'ToolNation Document';
    const element = document.getElementById('textEditor');
    
    // Store original styles
    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;
    const originalMaxHeight = element.style.maxHeight;
    
    // Temporarily remove height restrictions to capture all content
    element.style.height = 'auto';
    element.style.overflow = 'visible';
    element.style.maxHeight = 'none';
    
    // Options for html2pdf - configured to capture entire content
    const opt = {
        margin: 10,
        filename: `${pdfName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            scrollY: 0, // Start from top
            windowHeight: element.scrollHeight, // Use actual content height
            useCORS: true,
            logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Generate and download PDF
    html2pdf().set(opt).from(element).save().then(() => {
        // Restore original styles
        element.style.height = originalHeight;
        element.style.overflow = originalOverflow;
        element.style.maxHeight = originalMaxHeight;
    }).catch(error => {
        console.error('PDF generation error:', error);
        // Restore original styles even if there's an error
        element.style.height = originalHeight;
        element.style.overflow = originalOverflow;
        element.style.maxHeight = originalMaxHeight;
        alert('Error generating PDF. Please try again.');
    });
}
