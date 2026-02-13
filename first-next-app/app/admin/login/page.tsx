'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '../../../public/css/admin/common.css';
import '../../../public/css/admin/authn.css';
import websiteLogo from '../../../public/assets/website-logo.png';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        rememberMe: false
    });

    const [errors, setErrors] = useState({
        name: false,
        password: false
    });

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        setMessage({ type: '', text: '' });
        setErrors(prev => ({
            ...prev,
            name: formData.name.trim() === '' ? prev.name : false
        }));
    }, [formData.name]);

    useEffect(() => {
        setMessage({ type: '', text: '' });
        setErrors(prev => ({
            ...prev,
            password: formData.password.trim() === '' ? prev.password : false
        }));
    }, [formData.password]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === "checkbox" ? checked : value
        }));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const validateForm = () => {
        const newErrors = {
            name: (formData.name.trim() === ''),
            password: (formData.password.trim() === '')
        };
        setErrors(newErrors);
        return !newErrors.name && !newErrors.password;
    };

    function hideMessage() {
        setMessage({ type: '', text: '' });
    }

    function handleSubmit() {
        if (!validateForm()) {
            setMessage({ type: 'error', text: '請正確填寫所有必須欄位。' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (formData.name.trim() !== 'admin' && formData.password.trim() !== 'Abc123') {
                setMessage({ type: 'error', text: '帳戶ID和密碼不符。' });
            }
            else {
                setMessage({ type: 'success', text: '登入成功，跳轉中...' });
                
                console.log('Login successful, attempting to redirect...');
    
                setTimeout(() => {
                    console.log('Redirecting to /admin');
                    window.location.href = '/admin';
                }, 500);
            }
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error instanceof Error ? error.message : '登入失敗，請稍後再試' 
            });
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <main className='page-body full'>
            <div className='page-content authn'>
                <div className='widget'>
                    <div className='logo'>
                        <Image src={websiteLogo} alt='logo'/>
                    </div><div className='form'>
                        <form id='loginForm' method='post' autoComplete='off' onSubmit={(e) => e.preventDefault()}>
                            {message.text && (
                                <div className={`page-message iweby-tips-message ${message.type}`}>
                                    <div><a className="close" onClick={hideMessage}>×</a><span>{message.text}</span></div>
                                </div>
                            )}

                            <div className='iweby-row'>
                                <label className='name' htmlFor='name'>帳戶ID <small style={{color:'#f93a37'}}>*</small></label>
                                <div className={`iweby-input iweby-input-text ${errors.name ? 'error' : ''}`}>
                                    <input type='text' id='name' name='name' value={formData.name} onChange={handleChange} onKeyDown={handleKeyPress}/>
                                    {errors.name && (
                                      <small className="tips">請正確填寫此欄位。</small>
                                    )}
                                </div>
                            </div>

                            <div className='iweby-row'>
                                <label className='name' htmlFor='password'>密碼 <small style={{color:'#f93a37'}}>*</small></label>
                                <div className={`iweby-input iweby-input-password ${errors.password ? 'error' : ''}`}>
                                    <input type='password' id='password' name='password' value={formData.password} onChange={handleChange} onKeyDown={handleKeyPress}/>
                                     {errors.password && (
                                      <small className="tips">請正確填寫此欄位。</small>
                                    )}
                                </div>
                            </div>

                            <div className='iweby-row'>
                                <table width='100%'>
                                    <tbody><tr>
                                        <td>
                                            <div className='iweby-checkbox'>
                                                <input type='checkbox' id='remember_me' name='remember_me'
                                                checked={formData.rememberMe} onChange={handleChange}/>
                                                <label htmlFor='remember_me'>保持登入狀態</label>
                                            </div>
                                        </td>
                                        <td style={{textAlign:'right'}}><Link href='/admin/forgot'><u>忘記密碼?</u></Link></td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className='iweby-row last'>
                                <button type='button' className='btn full' onClick={handleSubmit} disabled={isLoading}>登入</button>
                            </div>
                        </form>
                    </div>
                    <div className='clearboth'></div>
                </div>
            </div>
        </main>
    )
}