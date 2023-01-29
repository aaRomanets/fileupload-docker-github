import axios from 'axios';
import React, {Component} from 'react'
import './App.css';

//компонент загрузки файлов
export class UploadFile extends Component {
    constructor(props) {
        super(props)

        //начальное состояние всех загруженных файлов (оно пустое)
        this.state = {
            //название каждого загружаемого файла
            selectedFiles:null,
            //отслеживатель процесса загрузки каждого файла на сервер cloudinary 
            progress:'',
            //название образовавшегося веб-адреса каждого файла на сервере cloudinary
            urls:[],
            //флаг загрузки каждого файла на сервер
            uploaded:false
        }
    }
    //функция фиксации состояния названий загружаемых файлов в selectedFiles.
    fileHandler = (event) => 
    {
        //фиксируем названия загружаемых файлов
        this.setState({selectedFiles: event.target.files});
    }
    //функция загрузки всех файлов
    fileUpload=()=>{
        let files=[];
        for (let i=0; i<this.state.selectedFiles.length; i++) 
        {
            //формируем данные для осуществления post-запроса на загрузку файла на сервер cloudinary
            let formData = new FormData();
            formData.append('file',this.state.selectedFiles[i]);
            formData.append('upload_preset','ogdn0qdq')
            //производим post запрос на загрузку файла на сервер cloudinary
            axios.post('https://api.cloudinary.com/v1_1/df3ugt9dd/image/upload',formData,
            {
                //отслеживаем указанную загрузку на сервер cloudinary
                onUploadProgress:(progressEvent) => 
                {
                    this.setState({progress: Math.round(progressEvent.loaded/progressEvent.total*100)+"%"});
                }
            })
            .then(response => 
            {
                //загрузка успешно осуществлена
                files.push(response.data.url);
                //формируем массив веб-адресов загруженных на сервер cloudinary указанных файлов 
                let urls=[...this.state.urls];
                urls.push(response.data.url);
                this.setState({urls})
                if (files.length === this.state.selectedFiles.length)
                {
                    //все файлы успешно загружены на сервер
                    this.setState({uploaded:true})
                    //поле ввода названий файлов загружаемых с диска на сервер cloudinary очищаем
                    this.fileInput.value="";
                    //отслеживатель progress загрузки указанных файлов на сервер cloudinary приводим в начальное состояние 
                    setTimeout(() => 
                    {
                        this.setState({uploaded:false, progress: ''})
                    }, 3000)
                }
            })
        }
    }
    render() {
        return (
            <div>
                <form className="fileupload">
                    {/*Поле ввода числа загружаемых файлов */}
                    <input 
                        type="file" 
                        ref={(ref) => (this.fileInput=ref)} 
                        multiple 
                        className="inputfile" 
                        onChange={this.fileHandler}
                    />
                    {/*Кнопка загрузки всех загруженных с диска файлов на сервер cloudinary */}
                    <input 
                        type="button" 
                        onClick={this.fileUpload} 
                        className="submit" 
                        //контролируем процесс загрузки всех указанных файлов на сервер cloudinary
                        value={this.state.progress ? 'Uploading..' + this.state.progress:'Upload'}
                    />
                </form>
                {/*фиксируем момент, когда указаная загрузка успешно осуществлена */}
                {this.state.uploaded && <h1 style={{textAlign: "center", color:"white"}}>Uploaded Successfully</h1>}
                <div style={{textAlign:"center"}}>
                    {this.state.urls.length > 0 && this.state.urls.map(url => (
                        //показываем каждый загруженный c диска файл по его сформированному веб-адресу на сервере cloudinary
                        <img key={url} src={url} alt="Cloudinary pic"/>
                    ))}
                </div>
            </div>
        )
    }
}
