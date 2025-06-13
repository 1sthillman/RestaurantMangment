// QR kod yönetimi için fonksiyonlar
const SUPABASE_URL = 'https://egcklzfiyxxnvyxwoowq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnY2tsemZpeXh4bnZ5eHdvb3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjQxMTcsImV4cCI6MjA2NDA0MDExN30.dfRQv3lYFCaI1T5ydOw4HyoEJ0I1wOSIUcG8ueEbxKQ';

// Supabase istemcisini başlat
let supabase = null;
let channel = null;

document.addEventListener('DOMContentLoaded', () => {
    initQrPage();
});

async function initQrPage() {
    // URL'den masa numarasını al
    const urlParams = new URLSearchParams(window.location.search);
    const tableId = urlParams.get('table');
    
    if (!tableId) {
        showError('Masa bilgisi bulunamadı.');
        return;
    }
    
    try {
        // Supabase bağlantısını oluştur
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Masa bilgisini yükle
        const { data: tableData, error: tableError } = await supabase
            .from('tables')
            .select('*')
            .eq('number', parseInt(tableId))
            .single();
            
        if (tableError) {
            console.error('Masa bilgisi yüklenirken hata:', tableError);
            showError('Masa bilgisi yüklenemedi.');
            return;
        }
        
        if (!tableData) {
            showError('Masa bulunamadı.');
            return;
        }
        
        // Sayfa başlığını güncelle
        document.getElementById('tableNumber').textContent = tableData.number;
        document.getElementById('qrPage').classList.remove('hidden');
        
        // Gerçek zamanlı bağlantıyı kur
        setupRealtimeConnection(tableData.number);
        
        // Buton event listener'ı ekle
        document.getElementById('callWaiterButton').addEventListener('click', () => {
            callWaiter(tableData.number);
        });
        
    } catch (err) {
        console.error('QR kod sayfası başlatma hatası:', err);
        showError('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

// Gerçek zamanlı bağlantıyı kur
function setupRealtimeConnection(tableNumber) {
    channel = supabase.channel(`table-${tableNumber}`)
        .on('broadcast', { event: 'waiter-response' }, (payload) => {
            if (payload.payload.tableNumber === tableNumber) {
                showWaiterResponse(payload.payload.message);
            }
        })
        .subscribe((status) => {
            console.log('Realtime bağlantı durumu:', status);
        });
}

// Garson çağırma fonksiyonu
async function callWaiter(tableNumber) {
    try {
        const callButton = document.getElementById('callWaiterButton');
        callButton.disabled = true;
        callButton.textContent = 'Garson çağrılıyor...';
        
        // Garson çağrı kaydını oluştur
        const { data, error } = await supabase
            .from('waiter_calls')
            .insert([
                { 
                    table_number: tableNumber,
                    status: 'waiting',
                    created_at: new Date().toISOString()
                }
            ]);
            
        if (error) {
            console.error('Garson çağırma hatası:', error);
            showError('Garson çağrılırken bir hata oluştu.');
            callButton.disabled = false;
            callButton.textContent = 'Garsonu Çağır';
            return;
        }
            
        // Bildirim gönder
        await supabase.channel('waiter-notifications')
            .send({
                type: 'broadcast',
                event: 'waiter-call',
                payload: { 
                    tableNumber: tableNumber,
                    status: 'waiting',
                    time: new Date().toISOString()
                }
            });
            
        showSuccess('Garson çağrınız alındı. En kısa sürede sizinle ilgileneceğiz.');
        
        // 30 saniye sonra butonu tekrar aktif et
        setTimeout(() => {
            callButton.disabled = false;
            callButton.textContent = 'Garsonu Çağır';
        }, 30000);
        
    } catch (err) {
        console.error('Garson çağırma hatası:', err);
        showError('Bir hata oluştu. Lütfen tekrar deneyin.');
        
        const callButton = document.getElementById('callWaiterButton');
        callButton.disabled = false;
        callButton.textContent = 'Garsonu Çağır';
    }
}

// Uyarı mesajı göster
function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    errorAlert.textContent = message;
    errorAlert.classList.remove('hidden');
    
    setTimeout(() => {
        errorAlert.classList.add('hidden');
    }, 5000);
}

// Başarı mesajı göster
function showSuccess(message) {
    const successAlert = document.getElementById('successAlert');
    successAlert.textContent = message;
    successAlert.classList.remove('hidden');
    
    setTimeout(() => {
        successAlert.classList.add('hidden');
    }, 5000);
}

// Garsonun cevabını göster
function showWaiterResponse(message) {
    const responseAlert = document.getElementById('waiterResponseAlert');
    responseAlert.textContent = message || 'Garsonunuz geliyor.';
    responseAlert.classList.remove('hidden');
    
    setTimeout(() => {
        responseAlert.classList.add('hidden');
    }, 8000);
} 