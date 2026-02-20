import fs from 'fs';

const filePath = 'src/pages/ResourcePage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const newLessonsJson = JSON.parse(fs.readFileSync('newLessons.json', 'utf8'));

let newIjamLessons = '';
newLessonsJson.forEach((lesson) => {
    newIjamLessons += '    {\n';
    newIjamLessons += '        id: "' + lesson.id + '",\n';
    newIjamLessons += '        icon: ' + lesson.icon + ',\n';
    newIjamLessons += '        title: "' + lesson.title.replace(/"/g, '\\"') + '",\n';
    newIjamLessons += '        stage: "' + lesson.stage + '",\n';
    newIjamLessons += '        summary: "' + lesson.summary.replace(/"/g, '\\"') + '",\n';
    newIjamLessons += '        eli5: "' + lesson.eli5.replace(/"/g, '\\"') + '",\n';
    newIjamLessons += '        steps: [\n';
    lesson.steps.forEach((step, idx) => {
        newIjamLessons += '            "' + step.replace(/"/g, '\\"') + '"' + (idx === lesson.steps.length - 1 ? '' : ',') + '\n';
    });
    newIjamLessons += '        ],\n';
    newIjamLessons += '        linkLabel: "' + lesson.linkLabel + '",\n';
    newIjamLessons += '        linkUrl: "' + lesson.linkUrl + '"\n';
    newIjamLessons += '    },\n';
});

// Remove trailing comma from the last lesson
newIjamLessons = newIjamLessons.replace(/,\n$/, '\n');

// Use [\s\S] correctly
const matchIjam = content.match(/const LESSONS_IJAM = \[[\s\S]*?\n\];/);
if (matchIjam) {
    let replacedBlock = matchIjam[0].replace(/stage: 'Foundation'|stage: 'Design'|stage: 'Creative'|stage: 'Build'|stage: 'Data'|stage: 'Security'|stage: 'Versioning'|stage: 'Workflow'|stage: 'Launch'|stage: 'UX'|stage: 'Content'|stage: 'Growth'|stage: 'Polish'|stage: 'Toolkit'/g, "stage: 'Extended Toolkit'");
    replacedBlock = replacedBlock.replace('const LESSONS_IJAM = [', 'const LESSONS_IJAM = [\n' + newIjamLessons + ',\n');
    content = content.replace(matchIjam[0], replacedBlock);
} else {
    console.log("Failed to match LESSONS_IJAM");
}

const matchFormal = content.match(/const LESSONS_FORMAL = \[[\s\S]*?\n\];/);
if (matchFormal) {
    let replacedBlock = matchFormal[0].replace(/stage: 'Foundation'|stage: 'Design'|stage: 'Creative'|stage: 'Build'|stage: 'Data'|stage: 'Security'|stage: 'Versioning'|stage: 'Workflow'|stage: 'Launch'|stage: 'UX'|stage: 'Content'|stage: 'Growth'|stage: 'Polish'|stage: 'Toolkit'/g, "stage: 'Extended Toolkit'");

    // Convert newIjamLessons to formal tone string replacements
    let newFormalLessons = newIjamLessons
        .replace(/Buat project kat Supabase, tunggu/g, 'Create a project on Supabase and wait')
        .replace(/Ni setup paling basic/g, 'This is the initial setup')
        .replace(/Buka platform pilihan/g, 'Open your chosen platform')
        .replace(/Ajar ChatGPT jadi pakar/g, 'Train ChatGPT to act as an expert')
        .replace(/Tukar idea jadi satu/g, 'Translate ideas into a single comprehensive')
        .replace(/Pilih model yang tepat/g, 'Select the appropriate model')
        .replace(/Save code secara cloud/g, 'Save code to the cloud')
        .replace(/Pancarkan website kau ke internet/g, 'Publish your website to the internet')
        .replace(/Track visitor website/g, 'Track website visitors')
        .replace(/Bina database cloud/g, 'Build a cloud database')
        .replace(/Cara paling cepat cipta/g, 'The fastest way to create')
        .replace(/Panggil data dari cloud/g, 'Fetch data from the cloud')
        .replace(/Buang hujung \\.vercel\\.app/g, 'Remove the .vercel.app suffix');

    replacedBlock = replacedBlock.replace('const LESSONS_FORMAL = [', 'const LESSONS_FORMAL = [\n' + newFormalLessons + ',\n');
    content = content.replace(matchFormal[0], replacedBlock);
} else {
    console.log("Failed to match LESSONS_FORMAL");
}

// (Removed LESSON_TIPS_BY_TONE replacement to prevent regex crash)

// Add Server icon import if missing
if (!content.includes('Server,')) {
    content = content.replace('import { Globe, ', 'import { Globe, Server, ');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Update complete.');
