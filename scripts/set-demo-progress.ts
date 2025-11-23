/**
 * Generate localStorage script to set progress to 25 lessons complete
 * Copy the output and paste into browser console
 */

const progress = {
  lessons: {} as Record<number, any>,
  facts: {} as Record<string, any>
};

// Mark lessons 1-25 as complete with 90% scores
for (let i = 1; i <= 25; i++) {
  progress.lessons[i] = {
    currentStep: 6,
    completed: true,
    passed: true,
    quizScore: 90,
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * i).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * (i - 1)).toISOString()
  };
}

// Generate the localStorage setter command
const script = `localStorage.setItem('acquisition_progress', '${JSON.stringify(progress)}');
window.location.reload();`;

console.log('\n📋 Copy this and paste into browser console:\n');
console.log(script);
console.log('\n✅ This will mark lessons 1-25 complete. You can then do lesson 26 + assessment!\n');

