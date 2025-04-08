// import { useState, useEffect, useRef, SetStateAction, Dispatch } from 'react'
// import { CKEditor } from '@ckeditor/ckeditor5-react'

// import axios from 'axios'

// import {
//   ClassicEditor,
//   Alignment,
//   Autoformat,
//   AutoImage,
//   FindAndReplace,
//   FontBackgroundColor,
//   FontColor,
//   FontFamily,
//   FontSize,
//   GeneralHtmlSupport,
//   Heading,
//   Highlight,
//   HtmlComment,
//   HtmlEmbed,
//   ImageCaption,
//   ImageInline,
//   ImageInsert,
//   ImageInsertViaUrl,
//   ImageResize,
//   ImageStyle,
//   ImageTextAlternative,
//   ImageUpload,
//   Link,
//   LinkImage,
//   List,
//   ListProperties,
//   Paragraph,
//   RemoveFormat,
//   SelectAll,
//   ShowBlocks,
//   SimpleUploadAdapter,
//   SourceEditing,
//   SpecialCharacters,
//   SpecialCharactersArrows,
//   SpecialCharactersCurrency,
//   SpecialCharactersEssentials,
//   SpecialCharactersLatin,
//   SpecialCharactersMathematical,
//   SpecialCharactersText,
//   Strikethrough,
//   Table,
//   TableCaption,
//   TableCellProperties,
//   TableColumnResize,
//   TableProperties,
//   TableToolbar,
//   TextTransformation,
//   Underline,
//   AccessibilityHelp,
//   AutoLink,
//   Autosave,
//   BlockQuote,
//   Bold,
//   Essentials,
//   ImageBlock,
//   ImageToolbar,
//   Italic,
//   Undo,
// } from 'ckeditor5'
// import translations from 'ckeditor5/translations/ar.js'
// import 'ckeditor5/ckeditor5.css'

// interface TextEditorProps {
//   textEditor: any
//   setTextEditor: Dispatch<any>
// }
// export default function TextEditor(props: TextEditorProps) {
//   const { setTextEditor, textEditor } = props
//   const editorContainerRef = useRef(null)
//   const editorRef = useRef(null)
//   const [isLayoutReady, setIsLayoutReady] = useState(false)
//   const data = {
//     textEditor: textEditor,
//   }

//   useEffect(() => {
//     setIsLayoutReady(true)

//     return () => setIsLayoutReady(false)
//   }, [])

//   const editorConfig = {
//     toolbar: {
//       items: [
//         'bold',
//         'underline',
//         'italic',
//         '|',
//         'alignment',
//         '|',
//         'numberedList',
//         'bulletedList',
//         '|',
//         'fontBackgroundColor',
//         'fontColor',
//         'fontFamily',
//         'fontSize',
//         '|',
//         'link',
//         'blockQuote',
//         'insertTable',
//         'mediaEmbed',
//         'insertImage',
//         '|',
//         'redo',
//         'undo',
//       ],
//       shouldNotGroupWhenFull: false,
//     },
//     plugins: [
//       AccessibilityHelp,
//       Alignment,
//       Autoformat,
//       AutoImage,
//       Autosave,
//       Bold,
//       BlockQuote,
//       Essentials,
//       FindAndReplace,
//       FontBackgroundColor,
//       FontColor,
//       FontFamily,
//       FontSize,
//       GeneralHtmlSupport,
//       Heading,
//       Highlight,
//       HtmlComment,
//       HtmlEmbed,
//       ImageBlock,
//       ImageCaption,
//       ImageInline,
//       ImageInsert,
//       ImageInsertViaUrl,
//       ImageResize,
//       ImageStyle,
//       ImageTextAlternative,
//       ImageToolbar,
//       ImageUpload,
//       Italic,
//       Link,
//       LinkImage,
//       List,
//       ListProperties,
//       Paragraph,
//       RemoveFormat,
//       SelectAll,
//       ShowBlocks,
//       SimpleUploadAdapter,
//       SourceEditing,
//       SpecialCharacters,
//       SpecialCharactersArrows,
//       SpecialCharactersCurrency,
//       SpecialCharactersEssentials,
//       SpecialCharactersLatin,
//       SpecialCharactersMathematical,
//       SpecialCharactersText,
//       Strikethrough,
//       Table,
//       TableCaption,
//       TableCellProperties,
//       TableColumnResize,
//       TableProperties,
//       TableToolbar,
//       TextTransformation,
//       Underline,
//       Undo,
//       AccessibilityHelp,
//       AutoLink,
//       Autosave,
//       BlockQuote,
//       Bold,
//       Essentials,
//       ImageBlock,
//       ImageToolbar,
//       Italic,
//       Link,
//       List,
//       ListProperties,
//       Paragraph,
//       SelectAll,
//       Undo,
//     ],
//     fontFamily: {
//       supportAllValues: true,
//     },
//     fontSize: {
//       options: [10, 12, 14, 'default', 18, 20, 22],
//       supportAllValues: true,
//     },
//     heading: {
//       options: [
//         {
//           model: 'paragraph',
//           title: 'Paragraph',
//           class: 'ck-heading_paragraph',
//         },
//         {
//           model: 'heading1',
//           view: 'h1',
//           title: 'Heading 1',
//           class: 'ck-heading_heading1',
//         },
//         {
//           model: 'heading2',
//           view: 'h2',
//           title: 'Heading 2',
//           class: 'ck-heading_heading2',
//         },
//         {
//           model: 'heading3',
//           view: 'h3',
//           title: 'Heading 3',
//           class: 'ck-heading_heading3',
//         },
//         {
//           model: 'heading4',
//           view: 'h4',
//           title: 'Heading 4',
//           class: 'ck-heading_heading4',
//         },
//         {
//           model: 'heading5',
//           view: 'h5',
//           title: 'Heading 5',
//           class: 'ck-heading_heading5',
//         },
//         {
//           model: 'heading6',
//           view: 'h6',
//           title: 'Heading 6',
//           class: 'ck-heading_heading6',
//         },
//       ],
//     },
//     htmlSupport: {
//       allow: [
//         {
//           name: /^.*$/,
//           styles: true,
//           attributes: true,
//           classes: true,
//         },
//       ],
//     },
//     image: {
//       toolbar: [
//         'toggleImageCaption',
//         'imageTextAlternative',
//         '|',
//         'imageStyle:inline',
//         'imageStyle:wrapText',
//         'imageStyle:breakText',
//         '|',
//         'resizeImage',
//       ],
//     },
//     // link: {
//     language: 'ar',
//     link: {
//       addTargetToExternalLinks: true,
//       defaultProtocol: 'https://',
//       decorators: {
//         toggleDownloadable: {
//           mode: 'manual',
//           label: 'Downloadable',
//           attributes: {
//             download: 'file',
//           },
//         },
//       },
//     },
//     list: {
//       properties: {
//         styles: true,
//         startIndex: true,
//         reversed: true,
//       },
//     },
//     placeholder: 'Type or paste your content here!',
//     translations: [translations],
//     table: {
//       contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'],
//     },
//   }
//   const handleEditorChange = (event: any, editor: any) => {
//     const data = editor.getData()
//     setTextEditor(data)
//   }
//   const handleEditorReady = (editor: any) => {
//     editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
//       return {
//         upload: async () => {
//           const file = await loader.file
//           const formData = new FormData()
//           formData.append('Thumbnail', file)
//           formData.append('Name', 'توضیحات')

//           try {
//             const response = await axios.post('https://localhost:7004/api/upload-media', formData, {
//               headers: {
//                 'Content-Type': 'multipart/form-data',
//               },
//             })

//             const data = response.data
//             console.log(data, 'data')

//             return {
//               default: data.data,
//             }
//           } catch (error) {
//             console.error('Error uploading file:', error)
//             throw new Error('File upload failed')
//           }
//         },

//         abort: () => {
//           console.log('Upload aborted')
//         },
//       }
//     }
//   }
//   return (
//     <div>
//       <div className="main-container">
//         <div className="editor-container editor-container_classic-editor" ref={editorContainerRef}>
//           <div className="editor-container__editor">
//             <div ref={editorRef}>
//               {isLayoutReady && (
//                 <CKEditor
//                   editor={ClassicEditor}
//                   config={editorConfig}
//                   data={textEditor}
//                   onChange={handleEditorChange}
//                   onReady={handleEditorReady}
//                 />
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
// import { useState, useEffect, useRef } from 'react';
// import { CKEditor } from '@ckeditor/ckeditor5-react';

// import {
//     ClassicEditor,
//     AccessibilityHelp,
//     Alignment,
//     Autoformat,
//     AutoImage,
//     AutoLink,
//     Autosave,
//     BalloonToolbar,
//     Base64UploadAdapter,
//     BlockQuote,
//     Bold,
//     CloudServices,
//     Code,
//     CodeBlock,
//     Essentials,
//     FindAndReplace,
//     FontBackgroundColor,
//     FontColor,
//     FontFamily,
//     FontSize,
//     Heading,
//     Highlight,
//     HorizontalLine,
//     GeneralHtmlSupport,
//     ImageBlock,
//     ImageCaption,
//     ImageInline,
//     ImageInsert,
//     ImageInsertViaUrl,
//     ImageResize,
//     ImageStyle,
//     ImageTextAlternative,
//     ImageToolbar,
//     ImageUpload,
//     Indent,
//     IndentBlock,
//     Italic,
//     Link,
//     LinkImage,
//     List,
//     ListProperties,
//     MediaEmbed,
//     Mention,
//     Paragraph,
//     PasteFromOffice,
//     RemoveFormat,
//     SelectAll,
//     SpecialCharacters,
//     SpecialCharactersArrows,
//     SpecialCharactersCurrency,
//     SpecialCharactersEssentials,
//     SpecialCharactersLatin,
//     SpecialCharactersMathematical,
//     SpecialCharactersText,
//     Strikethrough,
//     Subscript,
//     Superscript,
//     Style,
//     Table,
//     TableCaption,
//     TableCellProperties,
//     TableColumnResize,
//     TableProperties,
//     TableToolbar,
//     TextTransformation,
//     TodoList,
//     Underline,
//     Undo
// } from 'ckeditor5';

// import 'ckeditor5/ckeditor5.css';
// import axios from 'axios';

// interface EditorProps {
//     onChange?: any;
//     value?: any;
//     placeholder?: string;
// }

// const Editor: React.FC<EditorProps> = ({ value, onChange, placeholder }) => {
//     const editorContainerRef = useRef(null);
//     const editorRef = useRef(null);
//     const [isLayoutReady, setIsLayoutReady] = useState(false);

//     useEffect(() => {
//         setIsLayoutReady(true);

//         return () => setIsLayoutReady(false);
//     }, []);

//     const editorConfig = {
//         toolbar: {
//             items: [
//                 'undo',
//                 'redo',
//                 '|',
//                 'heading',
//                 '|',
//                 'fontSize',
//                 'alignment',
//                 'outdent',
//                 'indent',
//                 '|',
//                 'todoList',
//                 'bulletedList',
//                 'numberedList',
//                 '|',
//                 'insertImage',
//                 'insertTable',
//                 'link',
//                 'mediaEmbed',
//                 '|',
//                 'blockQuote',
//                 'code',
//                 'codeBlock',
//                 '|',
//                 'specialCharacters',
//                 'subscript',
//                 'superscript',
//                 'horizontalLine',
//             ],
//             shouldNotGroupWhenFull: false
//         },
//         plugins: [
//             AccessibilityHelp,
//             Alignment,
//             Autoformat,
//             AutoImage,
//             AutoLink,
//             Autosave,
//             BalloonToolbar,
//             Base64UploadAdapter,
//             BlockQuote,
//             Bold,
//             CloudServices,
//             Code,
//             CodeBlock,
//             Essentials,
//             FindAndReplace,
//             FontBackgroundColor,
//             FontColor,
//             FontFamily,
//             FontSize,
//             Heading,
//             Highlight,
//             HorizontalLine,
//             GeneralHtmlSupport,
//             ImageBlock,
//             ImageCaption,
//             ImageInline,
//             ImageInsert,
//             ImageInsertViaUrl,
//             ImageResize,
//             ImageStyle,
//             ImageTextAlternative,
//             ImageToolbar,
//             ImageUpload,
//             Indent,
//             IndentBlock,
//             Italic,
//             Link,
//             LinkImage,
//             List,
//             ListProperties,
//             MediaEmbed,
//             Mention,
//             Paragraph,
//             PasteFromOffice,
//             RemoveFormat,
//             SelectAll,
//             Style,
//             SpecialCharacters,
//             SpecialCharactersArrows,
//             SpecialCharactersCurrency,
//             SpecialCharactersEssentials,
//             SpecialCharactersLatin,
//             SpecialCharactersMathematical,
//             SpecialCharactersText,
//             Strikethrough,
//             Subscript,
//             Superscript,
//             Table,
//             TableCaption,
//             TableCellProperties,
//             TableColumnResize,
//             TableProperties,
//             TableToolbar,
//             TextTransformation,
//             TodoList,
//             Underline,
//             Undo
//         ],
//         balloonToolbar: ['style', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'fontFamily', 'fontColor', 'fontBackgroundColor', 'highlight', '|', 'link', '|', 'removeFormat',],
//         fontFamily: {
//             supportAllValues: true
//         },
//         fontSize: {
//             options: [10, 12, 14, 'default', 18, 20, 22],
//             supportAllValues: true
//         },
//         heading: {
//             options: [
//                 {
//                     model: 'paragraph',
//                     title: 'Paragraph',
//                     class: 'ck-heading_paragraph'
//                 },
//                 {
//                     model: 'heading1',
//                     view: 'h1',
//                     title: 'Heading 1',
//                     class: 'ck-heading_heading1'
//                 },
//                 {
//                     model: 'heading2',
//                     view: 'h2',
//                     title: 'Heading 2',
//                     class: 'ck-heading_heading2'
//                 },
//                 {
//                     model: 'heading3',
//                     view: 'h3',
//                     title: 'Heading 3',
//                     class: 'ck-heading_heading3'
//                 },
//                 {
//                     model: 'heading4',
//                     view: 'h4',
//                     title: 'Heading 4',
//                     class: 'ck-heading_heading4'
//                 },
//                 {
//                     model: 'heading5',
//                     view: 'h5',
//                     title: 'Heading 5',
//                     class: 'ck-heading_heading5'
//                 },
//                 {
//                     model: 'heading6',
//                     view: 'h6',
//                     title: 'Heading 6',
//                     class: 'ck-heading_heading6'
//                 }
//             ]
//         },
//         image: {
//             toolbar: [
//                 'toggleImageCaption',
//                 'imageTextAlternative',
//                 '|',
//                 'imageStyle:inline',
//                 'imageStyle:wrapText',
//                 'imageStyle:breakText',
//                 '|',
//                 'resizeImage'
//             ]
//         },
//         initialData: value || '',
//         language: 'vi',
//         link: {
//             addTargetToExternalLinks: true,
//             defaultProtocol: 'https://',
//             decorators: {
//                 toggleDownloadable: {
//                     mode: 'manual',
//                     label: 'Downloadable',
//                     attributes: {
//                         download: 'file'
//                     }
//                 }
//             }
//         },
//         list: {
//             properties: {
//                 styles: true,
//                 startIndex: true,
//                 reversed: true
//             }
//         },
//         mention: {
//             feeds: [
//                 {
//                     marker: '@',
//                     feed: [
//                         /* See: https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html */
//                     ]
//                 }
//             ]
//         },
//         placeholder: placeholder || "",
//         style: {
//             definitions: [
//                 {
//                     name: 'Code (Dark)',
//                     element: 'pre',
//                     classes: ['fancy-code', 'fancy-code-dark']
//                 },
//                 {
//                     name: 'Code (Light)',
//                     element: 'pre',
//                     classes: ['fancy-code', 'fancy-code-bright']
//                 }
//             ]
//         },
//         table: {
//             contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
//         },
//     };

//   const handleEditorReady = (editor: any) => {
//     editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
//       return {
//         upload: async () => {
//           const file = await loader.file
//           const formData = new FormData()
//           formData.append('Thumbnail', file)
//           formData.append('Name', 'توضیحات')

//           try {
//             const response = await axios.post('https://localhost:7004/api/upload-media', formData, {
//               headers: {
//                 'Content-Type': 'multipart/form-data',
//               },
//             })

//             const data = response.data
//             console.log(data, 'data')

//             return {
//               default: data.data,
//             }
//           } catch (error) {
//             console.error('Error uploading file:', error)
//             throw new Error('File upload failed')
//           }
//         },

//         abort: () => {
//           console.log('Upload aborted')
//         },
//       }
//     }
//   }

//     return (
//         <div>
//             <div className="w-full main-container">
//                 <div className="w-full editor-container editor-container_classic-editor editor-container_include-style" ref={editorContainerRef}>
//                     <div className="w-full editor-container__editor">
//                         <div className='w-full' ref={editorRef} spellCheck="false">
//                             {
//                                 isLayoutReady &&
//                                 <CKEditor
//                                     editor={ClassicEditor}
//                                     config={editorConfig as any}
//                                     onChange={(event: any, editor: any) => {
//                                         onChange?.(event, editor)
//                                     }}
//                                     onReady={handleEditorReady}
//                                 />
//                             }
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Editor;

import { useState, useEffect, useRef } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'

import {
  ClassicEditor,
  AccessibilityHelp,
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  Autosave,
  BalloonToolbar,
  Base64UploadAdapter,
  BlockQuote,
  Bold,
  CloudServices,
  Code,
  CodeBlock,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  Highlight,
  HorizontalLine,
  GeneralHtmlSupport,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Mention,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Subscript,
  Superscript,
  Style,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  Undo,
} from 'ckeditor5'

import 'ckeditor5/ckeditor5.css'
import axios from 'axios'

interface EditorProps {
  onChange?: any
  value?: any
  placeholder?: string
  isSupport?: boolean
}

const Editor: React.FC<EditorProps> = ({ value, onChange, placeholder , isSupport }) => {
  const editorContainerRef = useRef(null)
  const editorRef = useRef(null)
  const [isLayoutReady, setIsLayoutReady] = useState(false)

  useEffect(() => {
    setIsLayoutReady(true)

    return () => setIsLayoutReady(false)
  }, [])

  const editorConfig = {
    toolbar: {
      items: [
        'bold',
        'underline',
        'italic',
        '|',
        'fontSize',
        'alignment',
        'outdent',
        'indent',
        '|',
        'todoList',
        'bulletedList',
        'numberedList',
        '|',
        'insertImage',
        'insertTable',
        'link',
        'mediaEmbed',
        '|',
        'blockQuote',
        'code',
        'codeBlock',
        '|',
        'specialCharacters',
        'subscript',
        'superscript',
        'horizontalLine',
        '|',
        'undo',
        'redo',
      ],
      shouldNotGroupWhenFull: false,
    },
    plugins: [
      AccessibilityHelp,
      Alignment,
      Autoformat,
      AutoImage,
      AutoLink,
      Autosave,
      BalloonToolbar,
      Base64UploadAdapter,
      BlockQuote,
      Bold,
      CloudServices,
      Code,
      CodeBlock,
      Essentials,
      FindAndReplace,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      Heading,
      Highlight,
      HorizontalLine,
      GeneralHtmlSupport,
      ImageBlock,
      ImageCaption,
      ImageInline,
      ImageInsert,
      ImageInsertViaUrl,
      ImageResize,
      ImageStyle,
      ImageTextAlternative,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      Italic,
      Link,
      LinkImage,
      List,
      ListProperties,
      MediaEmbed,
      Mention,
      Paragraph,
      PasteFromOffice,
      RemoveFormat,
      SelectAll,
      Style,
      SpecialCharacters,
      SpecialCharactersArrows,
      SpecialCharactersCurrency,
      SpecialCharactersEssentials,
      SpecialCharactersLatin,
      SpecialCharactersMathematical,
      SpecialCharactersText,
      Strikethrough,
      Subscript,
      Superscript,
      Table,
      TableCaption,
      TableCellProperties,
      TableColumnResize,
      TableProperties,
      TableToolbar,
      TextTransformation,
      TodoList,
      Underline,
      Undo,
    ],
    balloonToolbar: [
      'style',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'fontFamily',
      'fontColor',
      'fontBackgroundColor',
      'highlight',
      '|',
      'link',
      '|',
      'removeFormat',
    ],
    fontFamily: {
      options: [
        'default',
        'IRANSansWeb, sans-serif',
        'Arial, Helvetica, sans-serif',
        'Courier New, Courier, monospace',
        'Georgia, serif',
        'Lucida Sans Unicode, Lucida Grande, sans-serif',
        'Tahoma, Geneva, sans-serif',
        'Times New Roman, Times, serif',
        'Trebuchet MS, Helvetica, sans-serif',
        'Verdana, Geneva, sans-serif',
      ],
      supportAllValues: true,
      default: 'IRANSansWeb',
    },
    
    heading: {
      options: [
        {
          model: 'paragraph',
          title: 'Paragraph',
          class: 'ck-heading_paragraph',
        },
        {
          model: 'heading1',
          view: 'h1',
          title: 'Heading 1',
          class: 'ck-heading_heading1',
        },
        {
          model: 'heading2',
          view: 'h2',
          title: 'Heading 2',
          class: 'ck-heading_heading2',
        },
        {
          model: 'heading3',
          view: 'h3',
          title: 'Heading 3',
          class: 'ck-heading_heading3',
        },
        {
          model: 'heading4',
          view: 'h4',
          title: 'Heading 4',
          class: 'ck-heading_heading4',
        },
        {
          model: 'heading5',
          view: 'h5',
          title: 'Heading 5',
          class: 'ck-heading_heading5',
        },
        {
          model: 'heading6',
          view: 'h6',
          title: 'Heading 6',
          class: 'ck-heading_heading6',
        },
      ],
    },
    image: {
      toolbar: [
        'toggleImageCaption',
        'imageTextAlternative',
        '|',
        'imageStyle:inline',
        'imageStyle:wrapText',
        'imageStyle:breakText',
        '|',
        'resizeImage',
      ],
    },
    language: 'ar',
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: 'https://',
      decorators: {
        toggleDownloadable: {
          mode: 'manual',
          label: 'Downloadable',
          attributes: {
            download: 'file',
          },
        },
      },
    },
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true,
      },
    },
    placeholder: placeholder || '',
    style: {
      definitions: [
        {
          name: 'Code (Dark)',
          element: 'pre',
          classes: ['fancy-code', 'fancy-code-dark'],
        },
        {
          name: 'Code (Light)',
          element: 'pre',
          classes: ['fancy-code', 'fancy-code-bright'],
        },
      ],
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'],
    },
  }

  const handleEditorReady = (editor: any) => {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
      return {
        upload: async () => {
          const file = await loader.file;
          
          // از FileReader برای تبدیل فایل به URL داده‌ای استفاده کنید
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({ default: reader.result });
            };
            reader.onerror = (error) => {
              reject('Error reading file: ' + error);
            };
            reader.readAsDataURL(file); // فایل را به data URL تبدیل می‌کند
          });
        },
  
        abort: () => {
          console.log('Upload aborted');
        },
      };
    };
  };
  

  return (
    <div>
      <div className={`w-full  main-container`}>
        <div
          className="w-full editor-container editor-container_classic-editor editor-container_include-style"
          ref={editorContainerRef}
        >
          <div className="w-full editor-container__editor">
            <div className="w-full" ref={editorRef} spellCheck="false">
              {isLayoutReady && (
                <CKEditor
                  editor={ClassicEditor}
                  config={editorConfig as any}
                  data={value}
                  onChange={(event: any, editor: any) => {
                    onChange?.(event, editor)
                  }}
                  onReady={handleEditorReady}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Editor
