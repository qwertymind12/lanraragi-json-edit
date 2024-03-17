// --- Left column elements

const importBtn = document.getElementById('import-btn');
const exportBtn = document.getElementById('export-btn');
const fileInput = document.getElementById('file-input');
const listSearch = document.getElementById('list-search');
const emptyFilter = document.getElementById('empty-filter');
const sortingFilter = document.getElementById('sorting-filter');
const titleSelect = document.getElementById('title-select');


// --- Right column elements

const archiveFile = document.getElementById('archive-file');
const archiveTitle = document.getElementById('archive-title');
const archiveTags = document.getElementById('archive-tags');
const applyBtn = document.getElementById('apply-btn');


// -- Current database and editable archive

let currentDatabase;
let currentArchive;


// --- Input handlers

importBtn.onclick = () => fileInput.click();
exportBtn.onclick = () => exportJson();
fileInput.onchange = () => importJson(fileInput.files);
listSearch.onchange = () => filterArchivesList();
emptyFilter.onchange = () => filterArchivesList();
sortingFilter.onchange = () => filterArchivesList();
titleSelect.onchange = () => setCurrentArchive(titleSelect.selectedOptions?.[0].value);
applyBtn.onclick = () => applyCurrentFormData();


// --- Implementation: import, export

const importJson = (files) => {
	let file = files[0];
	if (!file) {
		alert('No files selected');
		return;
	}
	const reader = new FileReader();
	reader.onload = (event) => {
		try {
			processJson(JSON.parse(event.target.result));
		}
		catch (err) {
			alert('Error parsing json');
		}
	};
	reader.readAsText(file);
};

const processJson = (json) => {
	const archives = json.archives;
	if (!archives) {
		throw new Error('Incorrect json format');
	}
	clearInputs();
	currentDatabase = json;
	filterArchivesList();
};

const exportJson = () => {
	if (!currentDatabase?.archives) {
		return;
	}
	var a = document.createElement('a');
	a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(currentDatabase))}`;
	a.download = 'backup-new.json';
	a.click();
};


// --- Implementation: archives list

const filterArchivesList = () => {
	if (!currentDatabase?.archives) {
		return;
	}
	const searchValue = listSearch.value.toLowerCase();
	let filteredList = currentDatabase.archives.filter((item) => (
		(!emptyFilter.checked || !item.tags) &&
		(!searchValue || item.filename.toLowerCase().includes(searchValue))
	));
	if (sortingFilter.checked) {
		filteredList = filteredList.sort((a, b) => (
			a.filename.toLowerCase().localeCompare(b.filename.toLowerCase())
		));
	}
	updateArchivesList(filteredList);
};

const updateArchivesList = (archives) => {
	removeAllChildren(titleSelect);
	archives.forEach((archive) => {
		if (!archive.arcid || !archive.filename) {
			console.warn(`Incorrect archive format: ${archive}`);
			return;
		}
		const newOption = document.createElement('option');
		newOption.value = archive.arcid;
		newOption.text = archive.filename;
		titleSelect.add(newOption);
	});
};

const removeAllChildren = (parent) => {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
};

const clearInputs = () => {
	listSearch.value = '';
	emptyFilter.checked = false;
	archiveFile.value = '';
	archiveTitle.value = '';
	archiveTags.value = '';
};


// --- Implementation: current archive

const setCurrentArchive = (arcid) => {
	if (!arcid) {
		return;
	}
	currentArchive = currentDatabase.archives.find((item) => item.arcid === arcid);
	if (!currentArchive) {
		return;
	}
	updateCurrentInputs();
};

const applyCurrentFormData = () => {
	if (!currentArchive) {
		return;
	}
	updateCurrentArchive();
	updateCurrentInputs();
};

const updateCurrentArchive = () => {
	currentArchive.filename = archiveFile.value.replaceAll(/(\r?\n)+/g, '');
	currentArchive.title = archiveTitle.value.replaceAll(/(\r?\n)+/g, '');
	currentArchive.tags = archiveTags.value.replaceAll(/(\r?\n)+/g, ',');
};

const updateCurrentInputs = () => {
	archiveFile.value = currentArchive.filename;
	archiveTitle.value = currentArchive.title;
	archiveTags.value = currentArchive.tags.replaceAll(',', '\n');
};
