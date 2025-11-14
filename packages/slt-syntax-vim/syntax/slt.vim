" Simple SLT syntax additions for vim (append localized keywords to js syntax groups)
if exists('b:current_syntax')
  finish
endif

syn keyword sltFunction función fonction funzione umsebenzi
syn keyword sltReturn vuelta retour ritorna buyisela

hi def link sltFunction Function
hi def link sltReturn Keyword
let b:current_syntax = 'slt'
