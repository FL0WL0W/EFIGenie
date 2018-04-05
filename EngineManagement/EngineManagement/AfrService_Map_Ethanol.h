#if defined(IAfrServiceExists)
#define AfrService_Map_EthanolExists
namespace EngineManagement
{
	struct __attribute__((__packed__)) AfrService_Map_EthanolConfig
	{
	private:
		AfrService_Map_EthanolConfig()
		{
			
		}
	public:
		static AfrService_Map_EthanolConfig* Cast(void *p)
		{
			return (AfrService_Map_EthanolConfig *)p;
		}
		
		float StartupAfrMultiplier;
		float StartupAfrDelay;
		float StartupAfrDecay;
		
		unsigned short MaxRpm;
		float MaxMapBar;
		unsigned char AfrRpmResolution;
		unsigned char AfrMapResolution;
		unsigned short *GasMap;
		unsigned short *EthanolMap;
		
		short MaxEct;
		short MinEct;
		unsigned char AfrEctResolution;
		float *EctMultiplierTable;
		
		unsigned char StoichResolution;
		unsigned short *StoichTable;
		
		unsigned char AfrTpsResolution;
		unsigned short *TpsMinAfrGas;
		unsigned short *TpsMinAfrEthanol;
	};
	
class AfrService_Map_Ethanol : public IAfrService
	{
	protected:
		const AfrService_Map_EthanolConfig* _config;
		unsigned int _startupTick;
		bool _started = false;
		bool _aeDone = false;
	public:
		AfrService_Map_Ethanol(const AfrService_Map_EthanolConfig *config);
		void CalculateAfr();
	};
}
#endif