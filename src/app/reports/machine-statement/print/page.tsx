import Script from 'next/script'; // ← si aún no está al inicio, agrégalo

{/* Auto-print si se llamó con ?auto=1 */}
{(searchParams as any)?.auto === '1' && (
  <Script id="auto-print">{`
    window.addEventListener('load', function () {
      setTimeout(function(){ window.print(); }, 100);
    });
  `}</Script>
)}
