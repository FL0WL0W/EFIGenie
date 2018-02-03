namespace EngineManagement
{
	class StaticAfrService : public IAfrService
	{
	public:
		StaticAfrService(float afr) { Afr = afr; }
		float Afr;
		float GetAfr() { return Afr; }
	};
}