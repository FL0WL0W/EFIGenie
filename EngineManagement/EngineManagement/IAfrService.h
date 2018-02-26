#define IAfrServiceExists
namespace EngineManagement
{
	class IAfrService
	{
	public:
		float Afr;
		float Lambda;
		virtual void CalculateAfr() = 0;
	};
	extern IAfrService *CurrentAfrService;
	IAfrService* CreateAfrService(void *config);
}